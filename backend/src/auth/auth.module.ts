import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [JwtModule.register({global: true, secret: 'your-secret-key', signOptions: { expiresIn: '3h' } })],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
