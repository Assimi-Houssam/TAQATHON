import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { TwoFactorRequiredException } from 'src/auth/exceptions/authentication-timeout.exception';
import { LogsType } from 'src/logs/enums/logs.enum';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private logsService: LogsService,
  ) {}

  async createSession(
    user: User,
    token: string,
    request: Request,
    twoFactorVerified: boolean = false,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      user,
      token,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      two_factor_verified: twoFactorVerified,
    });

    await this.logsService.createLog({
      action_type: LogsType.AUTH,
      action: `New session created for user ${user.email}`,
      previous_status: 'none',
      user_id: user.id,
    });

    return this.sessionRepository.save(session);
  }

  async validateSession(
    token: string,
    verifyTwoFactor: boolean = true,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { token, is_active: true },
      relations: ['user', 'user.avatar'],
    });

    if (!session || new Date() > session.expires_at) {
      throw new TokenExpiredError(
        'Invalid or expired session',
        session?.expires_at,
      );
    }

    if (
      verifyTwoFactor &&
      session.user.two_factor_enabled &&
      !session.two_factor_verified
    ) {
      throw new TwoFactorRequiredException();
    }

    session.last_activity = new Date();
    await this.sessionRepository.save(session);

    return session;
  }

  async invalidateSession(sessionId: number, userId: number): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    session.is_active = false;
    await this.sessionRepository.save(session);

    await this.logsService.createLog({
      action_type: LogsType.AUTH,
      action: `Session ${sessionId} invalidated`,
      previous_status: 'active',
      user_id: userId,
    });
  }

  async invalidateAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      { user: { id: userId }, is_active: true },
      { is_active: false },
    );

    await this.logsService.createLog({
      action_type: LogsType.AUTH,
      action: `All sessions invalidated for user ${userId}`,
      previous_status: 'active',
      user_id: userId,
    });
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return this.sessionRepository.manager.transaction(async (manager) => {
      // Cleanup and fetch in a single transaction
      await manager.update(
        Session,
        {
          user: { id: userId },
          expires_at: LessThan(new Date()),
          is_active: true,
        },
        { is_active: false },
      );

      return manager.find(Session, {
        where: { user: { id: userId }, is_active: true },
        order: { last_activity: 'DESC' },
      });
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.update(
      { expires_at: LessThan(new Date()), is_active: true },
      { is_active: false },
    );
  }

  async updateSessionTwoFactorVerification(
    userId: number,
    verified: boolean,
    sessionId: number,
  ): Promise<void> {
    await this.sessionRepository.update(
      {
        user: { id: userId },
        is_active: true,
        id: sessionId,
      },
      { two_factor_verified: verified },
    );
  }
}
