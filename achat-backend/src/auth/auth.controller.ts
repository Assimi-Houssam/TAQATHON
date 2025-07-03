import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import {
  RefreshTokenDto,
  SupplierLoginDto,
  SupplierRegisterDto,
} from './dto/auth.dto';
import { AuthGuard } from './guards/auth.guard';
import { Session } from 'src/session/entities/session.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: Request & { user: User }) {
    return req.user;
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Login failed' })
  async login(@Body() loginDto: SupplierLoginDto, @Req() req: Request) {
    return this.authService.login(loginDto.username, loginDto.password, req);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: Request & { user: User }) {}

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refresh_token);
  }

  @Post('register-supplier')
  @ApiOperation({ summary: 'Supplier registration' })
  @ApiResponse({ status: 201, description: 'Supplier successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerSupplier(@Body() registerDto: SupplierRegisterDto) {
    return this.authService.registerSupplier(registerDto);
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({ status: 200, description: 'Returns user sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSessions(@Req() req: Request & { user: User }) {
    return this.sessionService.getUserSessions(req.user.id);
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate specific session' })
  @ApiResponse({ status: 200, description: 'Session invalidated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async invalidateSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Req() req: Request & { user: User },
  ) {
    await this.sessionService.invalidateSession(sessionId, req.user.id);
    return { message: 'Session invalidated successfully' };
  }

  @Delete('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate all sessions' })
  @ApiResponse({
    status: 200,
    description: 'All sessions invalidated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async invalidateAllSessions(@Req() req: Request & { user: User }) {
    await this.sessionService.invalidateAllUserSessions(req.user.id);
    return { message: 'All sessions invalidated successfully' };
  }

  @Post('2fa/setup')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup 2FA' })
  async setup2FA(@Req() req: Request & { user: User }) {
    return this.authService.setup2FA(req.user);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable 2FA' })
  async verify2FA(
    @Req() req: Request & { user: User; session: Session },
    @Body() body: { token: string },
  ) {
    if (req.user.two_factor_enabled) {
      await this.authService.verify2FALogin(
        req.user.id,
        body.token,
        req.session.id,
      );
    } else {
      await this.authService.verify2FA(req.user.id, body.token);
    }
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  async disable2FA(
    @Req() req: Request & { user: User },
    @Body() body: { token: string },
  ) {
    return this.authService.disable2FA(req.user.id, body.token);
  }
}
