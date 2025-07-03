import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  forwardRef,
  HttpException,
  Inject,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { ChatService } from './chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { UserPayload } from 'types/user-payload.type';
import { WsCurrentUser } from '../../decorators/ws-current-user.decorator';
import {
  CreateMessageDto,
  messagePayloadSchema,
} from 'src/messages/dto/create-message.dto';
import { WsExceptionFilter } from 'filters/ws-exception.filter';
import { Chat } from './entities/chat.entity';
import { JwtService } from '@nestjs/jwt';
import { WsZodValidationPipe } from 'pipes/ws-validation.pipe';

interface MessagePayload {
  chat_id: number;
  message: CreateMessageDto;
}

@UseFilters(WsExceptionFilter)
@WebSocketGateway(4800, { namespace: 'chats', cors: { origin: '*' } })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedClients: Map<string, number> = new Map();
  private readonly logger: Logger = new Logger('ChatsGateway');

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const user = this.authenticateSocket(client);
      await this.initializeUserConnection(user, client);
    } catch (error) {
      this.handleConnectionError(client, error);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = client.data.user as UserPayload;
    if (user) {
      await client.leave(user.id.toString());
      this.connectedClients.delete(client.id);
      this.logger.log(
        `Client disconnected: ${client.id} - User ID: ${user.id}`,
      );
    }
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsZodValidationPipe(messagePayloadSchema))
    payload: MessagePayload,
  ) {
    try {
      const message = await this.messagesService.createMessage(
        payload.message,
        payload.chat_id,
      );

      const chat = await this.chatService.findOne(
        currentUser.id,
        payload.chat_id,
      );

      await this.notifyChatMembers(chat.chat_members, 'messageSent', message);

      this.logger.log(
        `Message with ID ${message.id} sent and chat members notified successfully.`,
      );
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      if (error instanceof HttpException) {
        throw new WsException(error.message);
      }
      throw new WsException('Error occurred while sending the message.');
    }
  }

  private async notifyChatMembers(
    members: User[],
    event: string,
    payload: any,
  ): Promise<void> {
    try {
      members.forEach((member) => {
        this.server.to(member.id.toString()).emit(event, payload);
      });
    } catch (error) {
      throw new WsException('Error notifying chat members.');
    }
  }

  private authenticateSocket(client: Socket): Partial<UserPayload> {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new WsException('Authentication token not provided');
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      return {
        id: payload.id,
      };
    } catch (error) {
      throw new WsException(`Invalid token: ${error.message}`);
    }
  }

  private async initializeUserConnection(
    userPayload: Partial<UserPayload>,
    client: Socket,
  ): Promise<void> {
    client.data.user = userPayload;
    this.connectedClients.set(client.id, userPayload.id);
    await client.join(userPayload.id.toString());

    const chats = await this.chatService.findByUserId(userPayload.id);
    this.server.to(client.id).emit('userAllChats', chats);

    this.logger.log(
      `Client connected: ${client.id} - User ID: ${userPayload.id}`,
    );
  }

  private handleConnectionError(client: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${client.id}: ${error.message}`,
    );
    client.emit('exception', 'Authentication error');
    client.disconnect(true);
  }

  async notifyNewChat(chat: Chat, creator_id: number): Promise<void> {
    await this.notifyChatMembers(chat.chat_members, 'chatCreated', {
      chat,
      creator_id,
    });
  }
}
