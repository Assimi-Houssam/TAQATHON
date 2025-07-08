import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class KpiService {
  constructor(private readonly Prisma: PrismaService) {}

  async actionplan() {
    try {
      const total = await this.Prisma.action_plan.count();
      const completed = await this.Prisma.action_plan.count({
        where: {
          status: 'COMPLETED',
        },
      });
      const inProgress = await this.Prisma.action_plan.count({
        where: {
          status: 'NOT_COMPLETED',
        },
      });

      return {
        action: {
          total: total,
          completed: completed,
          inProgress: inProgress,
        },
      };
    } catch (err) {
      console.error('Error in actionplan:', err);
      throw new Error('Failed to retrieve action plan data');
    }
  }

  async getAverageProcessingTime() {
    const anomalies = await this.Prisma.anomaly.findMany({
      where: {
        date_detection: { not: null },
        date_traitement: { not: null },
      },
      select: {
        date_detection: true,
        date_traitement: true,
      },
    });

    if (anomalies.length === 0) {
      return {
        averageHours: 0,
        averageDays: 0,
        totalAnomalies: 0,
        message: 'No anomalies found with both detection and treatment dates',
      };
    }
    let totalHours = 0;
    const timeDifferences = [];

    anomalies.forEach((anomaly) => {
      const detectionTime = new Date(anomaly.date_detection).getTime();
      const treatmentTime = new Date(anomaly.date_traitement).getTime();
      const diffInMs = treatmentTime - detectionTime;
      const diffInHours = diffInMs / (1000 * 60 * 60); 
      totalHours += diffInHours;
      timeDifferences.push({
        hours: diffInHours,
        days: diffInHours / 24,
      });
    });
    const averageHours = totalHours / anomalies.length;
    const averageDays = averageHours / 24;
    return {
      averageHours: Math.round(averageHours * 100) / 100,
      averageDays: Math.round(averageDays * 100) / 100,
      totalAnomalies: anomalies.length,
      minHours: Math.min(...timeDifferences.map((t) => t.hours)),
      maxHours: Math.max(...timeDifferences.map((t) => t.hours)),
      details: timeDifferences,
    };
  }


    async getAnomaliesInProgress(){
        const totalAnomalies = await this.Prisma.anomaly.count(
            {
                where : {
                    status : {
                        not : 'CLOSED'
                    }
                }
            }
        );
        const totalanomaliesinprogress = await this.Prisma.anomaly.count({
            where: {
            status : 'IN_PROGRESS'
            },
        });

        return {
            totalAnomalies,
            totalanomaliesinprogress,
            percentageWithDates: totalAnomalies > 0 ? (totalanomaliesinprogress / totalAnomalies) * 100 : 0,
        };

    }

    async getAnomaliesClosed() {
        const totalAnomalies = await this.Prisma.anomaly.count();

        const totalanomaliesclosed = await this.Prisma.anomaly.count({
            where: {
                status: 'CLOSED',
            },
        });

        return {
            totalAnomalies,
            totalanomaliesclosed,
            percentageWithDates: totalAnomalies > 0 ? (totalanomaliesclosed / totalAnomalies) * 100 : 0,
        };
    }

    async getAnomaliesByCriticality(){
        const totalanomalihigh = await this.Prisma.anomaly.count({
            where: {
            criticite: {
                in: ['9', '10', '11', '12', '13', '14', '15']
            },
            },
         })
        const totalanomalimedium = await this.Prisma.anomaly.count({
            where: {
            criticite: {
                in: ['6', '7', '8']
            },
            },
         })
        const totalanomalilow = await this.Prisma.anomaly.count({
            where: {
            criticite: {
                in: ['1', '2', '3', '4', '5']
            },
            },
         })
        return {
            totalanomalihigh,
            totalanomalimedium,
            totalanomalilow,
            percentageHigh: totalanomalihigh > 0 ? (totalanomalihigh / (totalanomalihigh + totalanomalimedium + totalanomalilow)) * 100 : 0,
            percentageMedium: totalanomalimedium > 0 ? (totalanomalimedium / (totalanomalihigh + totalanomalimedium + totalanomalilow)) * 100 : 0,
            percentageLow: totalanomalilow > 0 ? (totalanomalilow / (totalanomalihigh + totalanomalimedium + totalanomalilow)) * 100 : 0,
    }
    }

        async getanomaliesByStoppingRequirement() {
        const total = await this.Prisma.anomaly.count();
        
        const requiringStop = await this.Prisma.anomaly.count({
            where: {
            required_stoping: true,
            },
        });

        const notRequiringStop = await this.Prisma.anomaly.count({
            where: {
            required_stoping: false,
            },
        });

        return {
            total,
            requiringStop,
            notRequiringStop,
            percentageRequiringStop: total > 0 ? Math.round((requiringStop / total) * 100 * 100) / 100 : 0,
            percentageNotRequiringStop: total > 0 ? Math.round((notRequiringStop / total) * 100 * 100) / 100 : 0,
        };
        }
}