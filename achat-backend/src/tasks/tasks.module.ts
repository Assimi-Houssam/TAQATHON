import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SessionService } from 'src/session/session.service';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User]), LogsModule],
  controllers: [TasksController],
  providers: [TasksService, SessionService],
})
export class TasksModule {}
