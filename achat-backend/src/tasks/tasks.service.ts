import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/task.dto';
import { User } from 'src/users/entities/user.entity';
import { GetTasksDto } from './dto/task.dto';
import { userInfo } from 'os';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user,
    });

    await this.taskRepository.save(task);

    return task;
  }

  async findUserTasks(getTasksDto: GetTasksDto, userId: number) {
    const { page, limit }= getTasksDto;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.user.id = :userId', { userId })
      .andWhere('task.deleted = :deleted', { deleted: false })
      .select([
        'task.id',
        'task.title',
        'task.description',
        'task.completed',
        'task.createdAt',
        'task.updatedAt',
        'user.username',
      ])
      .orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: tasks,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.id = :id', { id })
      .andWhere('task.user.id = :userId', { userId })
      .andWhere('task.deleted = :deleted', { deleted: false })
      .select([
        'task.id',
        'task.title',
        'task.description',
        'task.completed',
        'task.createdAt',
        'task.updatedAt',
        'user.username',
      ])
      .getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async toggleTaskCompletion(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.update(id, { completed: !task.completed });
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.update(id, { deleted: true });
  }
}
