import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateCompanyChatDto } from './dto/create-company-chat.dto';
import { GetUser } from '../../decorators/get-user.decorator';
import { UserPayload } from 'types/user-payload.type';
import { ChatType } from './enums/chat.enum';
import { Chat } from './entities/chat.entity';
import { ChatDetailDto } from './dto/chat-details.dto';
import { User } from 'src/users/entities/user.entity';
import { InviteUsersDto } from './dto/invite-users.dto';
import { KickUserDto } from './dto/kick-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Chats')
@Controller('chats')
@UseGuards(AuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  // @Roles(KeycloakRole.CREATE_CHATS)
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, description: 'Chat created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createChat(
    @GetUser() user: UserPayload,
    @Body() createChatDto: CreateChatDto,
  ) {
    this.validateChatMembers(
      createChatDto.chat_type,
      createChatDto.chat_members,
      user.id,
    );
    return this.chatService.createChat(user.id, createChatDto);
  }

  @Post('company')
  @Roles(AppRole.CREATE_CHATS)
  @ApiOperation({ summary: 'Create a company chat group' })
  @ApiResponse({ status: 201, description: 'Company chat created successfully' })
  @ApiResponse({ status: 400, description: 'No members found in company' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createCompanyChat(
    @GetUser() user: UserPayload,
    @Body() createCompanyChatDto: CreateCompanyChatDto,
  ) {
    return this.chatService.createCompanyChat(user.id, createCompanyChatDto);
  }

  @Get()
  // @Roles(KeycloakRole.READ_OWN_CHATS)
  @ApiOperation({ summary: 'Get user chats' })
  @ApiResponse({ status: 200, description: 'Return user chats' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserChats(@GetUser() user: UserPayload): Promise<ChatDetailDto[]> {
    return this.chatService.findByUserId(user.id);
  }

  @Post(':id/invite')
  // @Roles(KeycloakRole.MODIFY_OWN_CHATS)
  @ApiOperation({ summary: 'Invite users to chat' })
  @ApiResponse({ status: 200, description: 'Users invited successfully' })
  @ApiResponse({ status: 403, description: 'Only chat owner can invite' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid members' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async inviteUsers(
    @GetUser() user: UserPayload,
    @Param('id', ParseIntPipe) chatId: number,
    @Body() inviteUsersDto: InviteUsersDto,
  ) {
    return this.chatService.inviteUsersToChat(
      user.id,
      chatId,
      inviteUsersDto.user_ids,
    );
  }

  @Patch(':id/lock')
  // @Roles(KeycloakRole.MODIFY_OWN_CHATS)
  @ApiOperation({ summary: 'Lock chat' })
  @ApiResponse({ status: 200, description: 'Chat lock status updated' })
  @ApiResponse({ status: 403, description: 'Only chat owner can lock' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async lockChat(
    @GetUser() user: UserPayload,
    @Param('id', ParseIntPipe) chatId: number,
  ): Promise<Chat> {
    return this.chatService.toggleChatLock(user.id, chatId, true);
  }

  @Patch(':id/unlock')
  // @Roles(KeycloakRole.MODIFY_OWN_CHATS)
  @ApiOperation({ summary: 'Unlock chat' })
  @ApiResponse({ status: 200, description: 'Chat lock status updated' })
  @ApiResponse({ status: 403, description: 'Only chat owner can unlock' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unlockChat(
    @GetUser() user: UserPayload,
    @Param('id', ParseIntPipe) chatId: number,
  ): Promise<Chat> {
    return this.chatService.toggleChatLock(user.id, chatId, false);
  }

  @Post(':id/kick')
  // @Roles(KeycloakRole.MODIFY_OWN_CHATS)
  @ApiOperation({ summary: 'Kick user from chat' })
  @ApiResponse({ status: 200, description: 'User kicked successfully' })
  @ApiResponse({ status: 403, description: 'Only chat owner can kick users' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid user or chat owner' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async kickUser(
    @GetUser() user: UserPayload,
    @Param('id', ParseIntPipe) chatId: number,
    @Body() kickUserDto: KickUserDto,
  ): Promise<Chat> {
    return this.chatService.kickUserFromChat(
      user.id,
      chatId,
      kickUserDto.user_id,
    );
  }

  private validateChatMembers(
    chatType: string,
    chatMembers: number[],
    currentUserId: number,
  ): void {
    if (chatType === ChatType.DIRECT && chatMembers.length !== 1) {
      throw new BadRequestException(
        'Private chat must have exactly one member',
      );
    }

    if (chatType === ChatType.GROUP && chatMembers.length < 1) {
      throw new BadRequestException(
        'Group chat must have at least two members',
      );
    }

    if (chatMembers.some((member) => member === currentUserId)) {
      throw new BadRequestException(
        'The room owner should not be included in the participants list',
      );
    }

    const uniqueMembers = new Set(chatMembers.map((member) => member));
    if (uniqueMembers.size !== chatMembers.length) {
      throw new BadRequestException('Chat members list contains duplicates');
    }
  }
}
