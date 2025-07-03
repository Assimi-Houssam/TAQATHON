import { UseFilters } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { WsExceptionFilter } from 'filters/ws-exception.filter';
import { UserPayload } from 'types/user-payload.type';

@UseFilters(WsExceptionFilter)
@WebSocketGateway(4801, { namespace: 'status', cors: { origin: '*' } })
export class OnlineStatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private connectedClients: Map<string, number> = new Map();
  private heartbeatInterval = 30000;
  private readonly heartbeats: Map<number, NodeJS.Timeout> = new Map();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const user = this.authenticateSocket(client);
      await this.initializeUserConnection(user, client);
    } catch (error) {
      client.emit('exception', 'Authentication error');
      client.disconnect(true);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = client.data.user as UserPayload;
    if (user?.id) {
      this.connectedClients.delete(client.id);
      await this.updateUserStatus(user.id, 'offline');
      this.clearHeartbeat(user.id);
      this.broadcastStatusChange(user.id, 'offline');
    }
  }

  private authenticateSocket(client: Socket): UserPayload {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.token;
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
    userPayload: UserPayload,
    client: Socket,
  ) {
    client.data.user = userPayload;
    this.connectedClients.set(client.id, userPayload.id);
    await this.updateUserStatus(userPayload.id, 'online');
    this.setupHeartbeat(userPayload.id);
    this.broadcastStatusChange(userPayload.id, 'online');
  }

  private async updateUserStatus(userId: number, status: string) {
    try {
      await this.userRepository.update(userId, { status });
    } catch (error) {
      console.error(`Failed to update user status: ${error.message}`);
    }
  }

  private setupHeartbeat(userId: number) {
    this.clearHeartbeat(userId);

    try {
      const interval = setInterval(async () => {
        const isConnected = Array.from(this.connectedClients.values()).includes(
          userId,
        );
        if (!isConnected) {
          this.clearHeartbeat(userId);
          await this.updateUserStatus(userId, 'offline');
          this.broadcastStatusChange(userId, 'offline');
          return;
        }
      }, this.heartbeatInterval);

      this.heartbeats.set(userId, interval);
    } catch (error) {
      console.error(`Failed to setup heartbeat for user ${userId}:`, error);
      this.clearHeartbeat(userId);
    }
  }

  private clearHeartbeat(userId: number) {
    const existingHeartbeat = this.heartbeats.get(userId);
    if (existingHeartbeat) {
      clearInterval(existingHeartbeat);
      this.heartbeats.delete(userId);
    }
  }

  private broadcastStatusChange(userId: number, status: string) {
    this.server.emit('statusChange', { userId, status });
  }
}
