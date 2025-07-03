import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionService } from 'src/session/session.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  AuthenticationTimeoutException,
  TwoFactorRequiredException,
} from '../exceptions/authentication-timeout.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const verifyTwoFactor = !request.path.endsWith('/auth/2fa/verify');
      const session = await this.sessionService.validateSession(
        token,
        verifyTwoFactor,
      );
      request['user'] = session.user;
      request['user']['permissions'] = payload.permissions || [];
      request['session'] = session;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AuthenticationTimeoutException();
      }
      if (error instanceof TwoFactorRequiredException) {
        throw new TwoFactorRequiredException();
      }
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
