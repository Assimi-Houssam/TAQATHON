import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from 'src/messages/dto/get-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
    chatId: number,
  ): Promise<Message> {
    try {
      const chat = await this.chatRepository.findOne({
        where: { id: chatId },
        relations: ['chat_members'],
      });

      if (!chat) {
        throw new NotFoundException(`Chat with ID "${chatId}" not found`);
      }

      const sender = await this.userRepository.findOne({
        where: { id: createMessageDto.sender_id },
      });

      if (!sender) {
        throw new NotFoundException(
          `User with ID "${createMessageDto.sender_id}" not found`,
        );
      }

      const isChatMember = chat.chat_members.some(
        (member) => member.id === createMessageDto.sender_id,
      );

      if (!isChatMember) {
        throw new ForbiddenException('User is not a member of this chat');
      }

      const message = this.messageRepository.create({
        ...createMessageDto,
        sender,
        chat,
      });

      await this.messageRepository.save(message);

      const savedMessage = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .select([
          'message.id',
          'message.content',
          'message.created_at',
          'sender.id',
          'sender.username',
          'sender.status',
          'sender.avatar',
        ])
        .where('message.id = :messageId', { messageId: message.id })
        .getOne();

      if (!savedMessage) {
        throw new NotFoundException('Failed to retrieve saved message');
      }

      return savedMessage;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the message',
      );
    }
  }

  async getByChatId(
    userId: number,
    chatId: number,
    { page, limit }: GetMessagesDto,
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const chatMember = await this.chatRepository
        .createQueryBuilder('chat')
        .innerJoin('chat.chat_members', 'member')
        .where('chat.id = :chatId', { chatId })
        .andWhere('member.id = :userId', { userId })
        .select('chat.id')
        .getOne();

      if (!chatMember) {
        throw new ForbiddenException('You are not a member of this chat');
      }

      const skip = (page - 1) * limit;

      const [messages, total] = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoin('message.sender', 'sender')
        .where('message.chat.id = :chatId', { chatId })
        .select([
          'message.id',
          'message.content',
          'message.created_at',
          'sender.id',
          'sender.first_name',
          'sender.last_name',
          'sender.username',
          'sender.bio',
          'sender.status',
          'sender.avatar',
        ])
        .orderBy('message.created_at', `${limit == 1 ? 'DESC' : 'ASC'}`)
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        messages,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An error occurred while retrieving messages',
      );
    }
  }
}
