import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserPayload } from 'types/user-payload.type';
import { GetUser } from 'decorators/get-user.decorator';
import { GetMessagesDto } from './dto/get-message.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(AuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('chat/:chatId')
  // @Roles(KeycloakRole.CREATE_CHATS)
  @ApiOperation({ summary: 'Create a new message in a chat' })
  @ApiParam({ name: 'chatId', type: Number, description: 'ID of the chat' })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  @ApiResponse({ status: 404, description: 'Chat or sender not found' })
  @ApiResponse({ status: 403, description: 'User is not a member of this chat' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createMessage(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() messageData: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(messageData, chatId);
  }

  @Get('chat/:chatId')
  // @Roles(KeycloakRole.READ_OWN_CHATS)
  @ApiOperation({ summary: 'Get messages from a chat with pagination' })
  @ApiParam({ name: 'chatId', type: Number, description: 'ID of the chat' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Return messages with pagination' })
  @ApiResponse({ status: 403, description: 'User is not a member of this chat' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMessagesByChatId(
    @GetUser() user: UserPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() getMessagesDto: GetMessagesDto,
  ) {
    return this.messagesService.getByChatId(user.id, chatId, getMessagesDto);
  }
}
