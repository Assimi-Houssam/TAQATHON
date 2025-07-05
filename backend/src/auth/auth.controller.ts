import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; password: string }): Promise<{ ok: boolean; jwt: string }> {
    const { email, password } = body;
    return await this.authService.login(email, password);
  }


  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(): Promise<{ ok: boolean}> {
    return {ok: true}
  }
}
