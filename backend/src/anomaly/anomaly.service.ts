import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAnomalieDto, UpdateAnomalieDto } from './dto/anomalie.dto';
import { ForceStopDto } from './dto/forceStop.dto';

@Injectable()
export class AnomalyService {
  constructor(private readonly Prisma: PrismaService) {}

  // adding filter by dure intervention , by  status
  async getAnomaly(
    page: number = 1,
    limit: number = 10,
    order: string = 'HIGH',
  ) {
    const skip = (page - 1) * limit;
    let anomaly: any;
    if (order == 'LOW' || order == 'HIGH') {
      let criticalityFilter: any = {};
      if (order == 'LOW') {
        criticalityFilter = {
          Criticite: 'asc',
        };
      } else if (order == 'HIGH') {
        criticalityFilter = {
          Criticite: 'desc',
        };
      }
      anomaly = await this.Prisma.anomaly.findMany({
        skip: skip,
        take: limit,
        orderBy: [
          { Criticite: criticalityFilter.Criticite },
          { status: 'desc' },
        ],
      });
    } else if (
      order == 'ORACLE' ||
      order == 'MAXIMO' ||
      order == 'EMC' ||
      order == 'APM'
    ) {
      anomaly = await this.Prisma.anomaly.findMany({
        skip: skip,
        take: limit,
        where: {
          origine: order,
        },
        orderBy: {
          Criticite: 'desc',
        },
      });
    } else if (order == 'NEW' || order == 'IN_PROGRESS' || order == 'CLOSED') {
      anomaly = await this.Prisma.anomaly.findMany({
        skip: skip,
        take: limit,
        where: {
          status: order,
        },
        orderBy: {
          Criticite: 'desc',
        },
      });
    }

    if (!anomaly || anomaly.length === 0) {
      return { message: 'No anomalies found' };
    }

    const totalAnomaly = await this.Prisma.anomaly.count();
    const totalPages = Math.ceil(totalAnomaly / limit);

    return {
      data: anomaly,
      totalAnomaly: totalAnomaly,
      totalPages: totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async getAnomalyById(id: string) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: id },
      include: {
        atachments: true,
        actions: true,
        rex_entrie: true,
      },
    });
    if (!anomaly) {
      return { message: 'Anomaly not found' };
    }
    return anomaly;
  }

  async createAnomaly(data: CreateAnomalieDto) {
    const date_detection = data.date_detection
      ? new Date(data.date_detection)
      : new Date();
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== '',
      ),
    );

    const anomaly = await this.Prisma.anomaly.create({
      data: {
        ...filteredData,
        date_detection: date_detection,
      },
    });

    return anomaly;
  }

  async uploadAttachment(anomalyId: string, file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const anomalie_entrie = await this.Prisma.anomaly.findUnique({
      where: { id: anomalyId },
    });
    if (!anomalie_entrie) {
      throw new Error('Anomaly not found');
    }

    const attachment = await this.Prisma.attachments.create({
      data: {
        anomaly_id: anomalyId,
        file_path: file.path,
        file_name: file.originalname,
      },
    });
    if (!attachment) {
      throw new Error('Failed to create attachment');
    }
    return {
      success: true,
      message: 'Attachment uploaded successfully',
      file_name: file.originalname,
      file_url: 'okey ', // we will develop this later, we will have a download button i guess or we will show it directly on our frontend
    };
  }

  async uploadMaintenanceWindow(filePath: string, sheetName?: string) {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    try {
      const fileMaintenance = await this.Prisma.maintenance_files.create({
        data: {
          file_path: filePath,
          file_name: sheetName || null,
        },
      });

      return fileMaintenance;
    } catch (error) {
      throw new Error(`Failed to upload maintenance window: ${error.message}`);
    }
  }

  async createMaintenanceWindow(
    start_date: Date,
    end_date: Date,
    duration_days: number,
    duration_hours: number,
    description?: string,
  ) {
    if (new Date(end_date) <= new Date()) {
      throw new Error('Invalid date range');
    }
    if (!description) description = `arret de ${duration_days} jours `;
    const maintenanceWindow = await this.Prisma.maintenance_window.create({
      data: {
        date_debut_arret: new Date(start_date),
        date_fin_arret: new Date(end_date),
        duree_jour: duration_days.toString(),
        duree_heure: duration_hours.toString(),
        titlte: description,
      },
    });
    return maintenanceWindow;
  }

  async getMaintenanceWindows() {
    const maintenanceWindows = await this.Prisma.maintenance_window.findMany();
    if (!maintenanceWindows || maintenanceWindows.length === 0) {
      return { message: 'No maintenance windows found' };
    }
    return maintenanceWindows;
  }

  async markAsResolved(id: string, file: any, summary?: string) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: id },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    const updatedAnomaly = await this.Prisma.anomaly.update({
      where: { id: id },
      data: {
        status: 'CLOSED',
        resolution_date: new Date(),
        rex_entrie: {
          create: {
            docment_path: file.path, // we will crearte a button for dowkload the document or we will show it directly on our frontend,
            summary: summary || null,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Anomaly marked as resolved',
      data: updatedAnomaly,
    };
  }

  async updateAnomaly(id: string, body: UpdateAnomalieDto) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: id },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }
    const updatedAnomaly = await this.Prisma.anomaly.update({
      where: { id: id },
      data: {
        ...body,
        date_detection: body.date_detection
          ? new Date(body.date_detection)
          : anomaly.date_detection,
      },
    });
    return updatedAnomaly;
  }

  async attachMaintenanceWindow(anomalyId: string, maintenanceId: string) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: anomalyId },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    const maintenanceWindow = await this.Prisma.maintenance_window.findUnique({
      where: { id: maintenanceId },
    });
    if (!maintenanceWindow) {
      throw new Error('Maintenance window not found');
    }

    const updateMaintenacneWinodw = await this.Prisma.anomaly.update({
      where: { id: anomalyId },
      data: {
        maintenance_window: {
          connect: { id: maintenanceId },
        },
      },
    });
    return updateMaintenacneWinodw;
  }

  async markAsTreated(id: string) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: id },
      include: {
        atachments: true,
        actions: true,
      },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }
    if (anomaly.actions.length === 0) {
      throw new Error(
        "Le plan d'action est vide, veuillez le remplir avant de résoudre l'anomalie",
      );
    }
    if (
      anomaly.duree_intervention === null ||
      anomaly.duree_intervention === undefined
    ) {
      throw new Error(
        "La durée d'intervention n'est pas définie, veuillez la remplir avant de résoudre l'anomalie",
      );
    }
    await this.Prisma.anomaly.update({
      where: { id: id },
      data: {
        status: 'IN_PROGRESS',
        date_traitement: new Date(),
      },
    });

    const maintenanceWindow = await this.anomalyToMaintenanceWindow(id);
    if (!maintenanceWindow.success) {
      throw new Error(`Failed to attach anomaly to maintenance window`);
    }

    return {
      success: true,
      message: 'Anomaly resolved successfully',
      updatedAnomaly: maintenanceWindow.updatedAnomaly,
      maintenanceWindow: maintenanceWindow.maintenanceWindow,
    };
  }

  extractHours = (duration: string): number => {
    if (!duration) return 0;
    const match = duration.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  async anomalyToMaintenanceWindow(anomalyId: string) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: anomalyId },
    });

    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    if (anomaly.status !== 'IN_PROGRESS') {
      throw new Error(
        'Anomaly must be in "traited" status to be attached to a maintenance window',
      );
    }

    const requiredHours = this.extractHours(anomaly.duree_intervention || '0');
    const maintenanceWindows = await this.Prisma.maintenance_window.findMany({
      where: {
        date_debut_arret: {
          gte: new Date(),
        },
      },
      orderBy: {
        date_debut_arret: 'asc',
      },
    });
    const suitableWindow = maintenanceWindows.find((window) => {
      const windowHours = this.extractHours(window.duree_heure || '0');
      return windowHours >= requiredHours;
    });
    if (!suitableWindow) {
      throw new Error(
        `No maintenance window found with sufficient duration (${requiredHours}h required)`,
      );
    }
    const updatedAnomaly = await this.Prisma.anomaly.update({
      where: { id: anomalyId },
      data: {
        maintenance_window: {
          connect: { id: suitableWindow.id },
        },
      },
    });

    return {
      success: true,
      updatedAnomaly: updatedAnomaly,
      maintenanceWindow: suitableWindow,
    };
  }

  async addingMaintenanceWindow(data: ForceStopDto) {
    const {
      date_debut_arret,
      date_fin_arret,
      titlte,
      duree_jour,
      duree_heure,
    } = data;
    if (!date_debut_arret || !date_fin_arret) {
      throw new Error('Start and end dates are required');
    }
    const dateDebutArret = new Date(date_debut_arret);
    const dateFinArret = new Date(date_fin_arret);
    const forceStopentrie = await this.Prisma.maintenance_window.create({
      data: {
        date_debut_arret: dateDebutArret,
        date_fin_arret: dateFinArret,
        titlte,
        duree_jour,
        duree_heure,
      },
    });
    if (!forceStopentrie) {
      throw new Error('Failed to create force stop entry');
    }
    const automatedAssignment =
      await this.autoAssigmentAnomalyToMaintenanceWindowForceStop();

    return {
      success: true,
      message: 'Force stop entry created successfully',
      data: forceStopentrie,
      automatedAssignment: automatedAssignment,
    };
  }

  async autoAssigmentAnomalyToMaintenanceWindowForceStop() {
    try {
      const maintenance_window =
        await this.Prisma.maintenance_window.findMany();
      const anomaly = await this.Prisma.anomaly.findMany({
        where: { status: 'IN_PROGRESS', required_stoping: true },
      });

      if (!maintenance_window.length)
        return { success: false, message: 'No maintenance windows found' };
      if (!anomaly.length)
        return { success: true, message: 'No anomalies requiring assignment' };

      const results = [];

      for (const anom of anomaly) {
        try {
          const requiredHours = this.extractHours(
            anom.duree_intervention || '0',
          );

          const suitableWindow = maintenance_window
            .filter((w) => {
              const windowHours = this.extractHours(w.duree_heure || '0');
              const startDate = new Date(w.date_debut_arret);
              return windowHours >= requiredHours && startDate > new Date();
            })
            .sort(
              (a, b) =>
                new Date(a.date_debut_arret).getTime() -
                new Date(b.date_debut_arret).getTime(),
            )[0];

          if (!suitableWindow) {
            results.push({
              anomalyId: anom.id,
              assigned: false,
              reason: 'No suitable window found',
            });
            continue;
          }

          await this.Prisma.anomaly.update({
            where: { id: anom.id },
            data: {
              maintenance_window: { connect: { id: suitableWindow.id } },
            },
          });

          results.push({
            anomalyId: anom.id,
            assigned: true,
            windowId: suitableWindow.id,
          });
        } catch (error) {
          results.push({
            anomalyId: anom.id,
            assigned: false,
            reason: error.message,
          });
        }
      }

      const assigned = results.filter((r) => r.assigned).length;
      return {
        success: true,
        message: `Processed ${anomaly.length} anomalies: ${assigned} assigned`,
        results,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async actionPlan(anomalyId: string, body: any) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: anomalyId },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    const actionPlan = await this.Prisma.action_plan.create({
      data: {
        ...body,
        anomaly: {
          connect: { id: anomalyId },
        },
      },
    });

    return {
      success: true,
      message: 'Action plan created successfully',
      data: actionPlan,
    };
  }
}

//  when status is traite with  attach with -> the action plan  chanfe to traite and attach it to a maintenance window
// does not become traiter auto until a evry feild is full and will beoome traiete manulemnet
// save time between the date detection and the date traitement
// confedence with data
