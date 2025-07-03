import {
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from './entities/notification.entity';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'filters/ws-exception.filter';
import { UserPayload } from 'types/user-payload.type';
@UseFilters(WsExceptionFilter)
@WebSocketGateway(5140, {
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Map<string, number> = new Map();
  private readonly logger: Logger = new Logger('NotificationsGateway');

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const user = this.authenticateSocket(client);
      await this.initializeUserConnection(user, client);
      this.logger.log(`Client connected: ${client.id}, User ID: ${user.id}`);
    } catch (err) {
      this.handleConnectionError(client, err);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const userId = this.clients.get(client.id);
      if (userId) {
        this.clients.delete(client.id);
        client.leave(userId.toString());
        this.logger.log(
          `Client disconnected: ${client.id}, User ID: ${userId}`,
        );
      }
    } catch (err) {
      this.logger.error(`Error during disconnect: ${err.message}`);
    }
  }

  private authenticateSocket(client: Socket): UserPayload {
    const token = client.handshake.auth.token;
    if (!token) {
      throw new WsException('Authentication token not provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return payload;
    } catch (err) {
      throw new WsException(`Invalid token: ${err.message}`);
    }
  }

  private async initializeUserConnection(
    userPayload: UserPayload,
    client: Socket,
  ) {
    this.clients.set(client.id, userPayload.id);
    await client.join(userPayload.id.toString());
  }

  private handleConnectionError(client: Socket, error: Error) {
    this.logger.error(
      `Connection error for socket ${client.id}: ${error.message}`,
    );
    client.emit('error', { message: 'Authentication failed' });
    client.disconnect();
  }

  sendNotificationToUser(userId: number, notification: Notification) {
    this.server.to(userId.toString()).emit('notification', notification);
    this.logger.log(`Notification sent to User ID: ${userId}`);
  }

  sendNotificationToAll(notification: Notification) {
    this.server.emit('notification', notification);
    this.logger.log('Notification sent to all users');
  }

  sendNotificationToUsers(userIds: number[], notification: Notification) {
    userIds.forEach((userId) => {
      this.server.to(userId.toString()).emit('notification', notification);
      this.logger.log(`Notification sent to User ID: ${userId}`);
    });
  }
}
