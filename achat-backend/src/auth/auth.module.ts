import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service';
import { SessionService } from 'src/session/session.service';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from 'src/mail/mail.module';
import { DocumentModule } from 'src/documents/doc.module';
import { RoleService } from './services/role.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { Session } from 'src/session/entities/session.entity';
import { Log } from 'src/logs/entities/log.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Role, Permission, User, Session, Log]),
    MailModule,
    DocumentModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RoleService,
    UsersService,
    SessionService,
    LogsService,
  ],
  exports: [AuthService, RoleService],
})
export class AuthModule {}
