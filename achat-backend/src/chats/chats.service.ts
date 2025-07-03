import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { MessagesService } from 'src/messages/messages.service';
import { User } from 'src/users/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ChatsGateway } from './chats.gateway';
import { ChatDetailDto } from './dto/chat-details.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateCompanyChatDto } from './dto/create-company-chat.dto';
import { Chat } from './entities/chat.entity';
import { ChatType } from './enums/chat.enum';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly messagesService: MessagesService,
    @Inject(forwardRef(() => ChatsGateway))
    private readonly chatsGateway: ChatsGateway,
  ) {}

  async createChat(
    userId: number,
    createChatDto: CreateChatDto,
  ) {
    try {
      const { chat_members, chat_type, ...chatDetails } = createChatDto;

      if (chat_type === ChatType.DIRECT) {
        const existingChat = await this.chatRepository
          .createQueryBuilder('chat')
          .innerJoin('chat.chat_members', 'member')
          .where('chat.chat_type = :type', { type: 'DIRECT' })
          .andWhere('member.id IN (:...ids)', {
            ids: [userId, ...chat_members],
          })
          .groupBy('chat.id')
          .having('COUNT(member.id) = :count', { count: 2 })
          .getOne();

        if (existingChat) {
          return existingChat;
        }
      }

      const members = await this.userRepository.findBy({
        id: In([...chat_members, userId]),
      });

      if (members.length !== new Set([...chat_members, userId]).size) {
        throw new BadRequestException('Some users not found');
      }

      const chat = this.chatRepository.create({
        ...chatDetails,
        chat_type,
        chat_members: members,
        created_by: userId,
      });

      const savedChat = await this.chatRepository.save(chat);

      await this.chatsGateway.notifyNewChat(savedChat, userId);

      const chatWithMembers = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.chat_members', 'member')
        .select([
          'chat',
          'member.id',
          'member.first_name',
          'member.last_name',
          'member.username',
          'member.bio',
          'member.status',
        ])
        .where('chat.id = :chatId', { chatId: savedChat.id })
        .getOne();

      this.logger.log({
        message: 'Chat created successfully',
        chatId: savedChat.id,
        createdBy: userId,
        memberCount: members.length,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to create chat',
        error: error.message,
        userId,
        stack: error.stack,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create chat');
    }
  }

  async createCompanyChat(
    userId: number,
    createCompanyChatDto: CreateCompanyChatDto,
  ) {
    try {
      const { company_id, ...chatDetails } = createCompanyChatDto;

      const companyMembers = await this.userRepository.find({
        where: { 
          company: { id: company_id },
          is_active: true
        },
      });

      if (!companyMembers.length) {
        throw new BadRequestException('No members found in the company');
      }

      const chat = this.chatRepository.create({
        ...chatDetails,
        chat_type: ChatType.GROUP,
        created_by: userId,
        chat_members: companyMembers,
      });

      const savedChat = await this.chatRepository.save(chat);

      this.chatsGateway.notifyNewChat(savedChat, userId);

      return savedChat;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create company chat');
    }
  }

  async findByUserId(userId: number): Promise<ChatDetailDto[]> {
    try {
      const chats = await this.chatRepository
        .createQueryBuilder('chat')
        .innerJoin('chat.chat_members', 'member', 'member.id = :userId', {
          userId,
        })
        .leftJoinAndSelect('chat.chat_members', 'members')
        .select([
          'chat',
          'members.id',
          'members.first_name',
          'members.last_name',
          'members.username',
          'members.bio',
          'members.status',
          'members.avatar',
        ])
        .getMany();

      const chatDetailsList: ChatDetailDto[] = [];

      for (const chat of chats) {
        const last_message_result = await this.messagesService.getByChatId(
          userId,
          chat.id,
          {
            page: 1,
            limit: 1,
          },
        );

        const chatDetails = plainToInstance(ChatDetailDto, {
          ...chat,
          last_message: last_message_result.total
            ? last_message_result.messages[0]
            : null,
          chat_members: chat.chat_members,
        });

        chatDetailsList.push(chatDetails);
      }

      return chatDetailsList;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user chats: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while retrieving user rooms. Please try again later.',
      );
    }
  }

  async findOne(userId: number, chatId: number): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: chatId },
        relations: ['chat_members'],
      });
      if (!chat) {
        throw new BadRequestException(`Chatwith ID "${chatId}" not found.`);
      }

      const isChatMember = chat.chat_members.some(
        (member) => member.id === userId,
      );
      if (!isChatMember) {
        throw new BadRequestException('User is not a member of this chat');
      }

      //? should I sanitize the members list before returning the chat?
      return chat;
    } catch (error) {
      this.logger.error(
        `Failed to find chat with ID ${chatId} for user ID ${userId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while retrieving the chat.',
      );
    }
  }

  async inviteUsersToChat(
    ownerId: number,
    chatId: number,
    newMemberIds: number[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chat = await this.chatRepository.findOne({
        where: { id: chatId },
        relations: ['chat_members'],
      });

      if (!chat) {
        throw new NotFoundException(`Chat with ID "${chatId}" not found`);
      }

      if (chat.created_by != ownerId) {
        throw new ForbiddenException('Only chat owner can invite new members');
      }

      const existingMemberIds = chat.chat_members.map((member) => member.id);
      const dupMembers = newMemberIds.filter((id) =>
        existingMemberIds.includes(id),
      );
      if (dupMembers.length > 0) {
        throw new BadRequestException(
          'Some users are already members of this chat',
        );
      }

      const newMembers = await this.userRepository.findBy({
        id: In(newMemberIds),
      });

      if (newMembers.length != newMemberIds.length) {
        throw new BadRequestException('Some users not found');
      }

      chat.chat_members = [...chat.chat_members, ...newMembers];
      const updatedChat = await queryRunner.manager.save(chat);
      await queryRunner.commitTransaction();

      this.logger.log({
        message: 'Users invited to chat successfully',
        chatId: chat.id,
        invitedBy: ownerId,
        newMembers: newMemberIds,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error({
        message: 'Failed to invite users to chat',
        error: error.message,
        chatId,
        ownerId,
        newMemberIds,
        stack: error.stack,
      });

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to invite users to chat');
    } finally {
      await queryRunner.release();
    }
  }

  async toggleChatLock(
    ownerId: number,
    chatId: number,
    shouldLock: boolean,
  ): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException(`Chat with ID "${chatId}" not found`);
      }

      if (chat.created_by !== ownerId) {
        throw new ForbiddenException(
          'Only chat owner can lock/unlock the chat',
        );
      }

      if (chat.is_locked === shouldLock) {
        return chat;
      }

      chat.is_locked = shouldLock;
      const updatedChat = await this.chatRepository.save(chat);

      this.logger.log({
        message: `Chat ${shouldLock ? 'locked' : 'unlocked'} successfully`,
        chatId: chat.id,
        ownerId,
        lockStatus: shouldLock,
      });

      return updatedChat;
    } catch (error) {
      this.logger.error({
        message: 'Failed to change chat lock status',
        error: error.message,
        chatId,
        ownerId,
        stack: error.stack,
      });
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to change chat lock status',
      );
    }
  }

  async kickUserFromChat(
    ownerId: number,
    chatId: number,
    userIdToKick: number,
  ): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: chatId },
        relations: ['chat_members'],
      });

      if (!chat) {
        throw new NotFoundException(`Chat with ID "${chatId}" not found`);
      }

      if (chat.created_by !== ownerId) {
        throw new ForbiddenException('Only chat owner can kick users');
      }

      if (userIdToKick === ownerId) {
        throw new BadRequestException('Chat owner cannot be kicked');
      }

      const userToKick = chat.chat_members.find(
        (member) => member.id === userIdToKick,
      );

      if (!userToKick) {
        throw new NotFoundException(
          `User with ID "${userIdToKick}" is not a member of this chat`,
        );
      }

      chat.chat_members = chat.chat_members.filter(
        (member) => member.id !== userIdToKick,
      );

      const updatedChat = await this.chatRepository.save(chat);

      this.logger.log({
        message: 'User kicked from chat successfully',
        chatId: chat.id,
        ownerId,
        kickedUserId: userIdToKick,
      });

      return updatedChat;
    } catch (error) {
      this.logger.error({
        message: 'Failed to kick user from chat',
        error: error.message,
        chatId,
        ownerId,
        userIdToKick,
        stack: error.stack,
      });

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to kick user from chat');
    }
  }
}
