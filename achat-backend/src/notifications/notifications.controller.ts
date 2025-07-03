import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { GetUser } from 'decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppRole } from '../auth/enums/app-roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Return all notifications for the user',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  //   @Roles(KeycloakRole.READ_OWN_NOTIFICATIONS)
  async getUserNotifications(@GetUser() user: User): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(user);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  //   @Roles(KeycloakRole.MODIFY_OWN_NOTIFICATIONS)
  async markAllNotificationsAsRead(
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    await this.notificationService.markAllNotificationsAsRead(user);
    return { message: 'All notifications marked as read' };
  }
}
