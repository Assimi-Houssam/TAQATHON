import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CronService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(CronService.name);

  // Runs every day at midnight (00:00:00)
  @Cron('0 0 * * *')
  async handleMidnightCron() {
    this.logger.debug('Midnight cron job started');
    try {
      await this.performMidnightTasks();
      this.logger.log('Midnight cron job completed successfully');
    } catch (error) {
      this.logger.error('Midnight cron job failed:', error);
    }
  }

  private async performMidnightTasks() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiredMaintenanceWindows =
        await this.prisma.maintenance_window.findMany({
          where: {
            date_fin_arret: {
              lte: today,
            },
          },
          include: {
            anomaly: true,
          },
        });
      let processedCount = 0;
      for (const mw of expiredMaintenanceWindows) {
        try {
          if (mw.anomaly && mw.anomaly.length > 0) {
            await this.prisma.anomaly.updateMany({
              where: {
                maintenance_window_id: mw.id,
              },
              data: {
                maintenance_window_id: null, // Disconnect anomalies
              },
            });
          }
          await this.prisma.maintenance_window.delete({
            where: { id: mw.id },
          });
          processedCount++;
        } catch (deleteError) {
          this.logger.error(
            `Failed to process maintenance window ${mw.id}:`,
            deleteError,
          );
        }
      }
      this.logger.log(
        `Processed ${processedCount} expired maintenance windows`,
      );
    } catch (error) {
      this.logger.error('Error in performMidnightTasks:', error);
    }
  }
}
