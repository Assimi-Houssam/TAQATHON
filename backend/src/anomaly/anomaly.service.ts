import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAnomalieDto, UpdateAnomalieDto } from './dto/anomalie.dto';
import { ForceStopDto } from './dto/forceStop.dto';
import { UpdateActionPlanDto } from './dto/actionPlan.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AnomalyService {
  constructor(private readonly Prisma: PrismaService) {}

  async getAnomaly(
    page: number = 1,
    limit: number = 10,
    order: string = 'HIGH',
    status: string = '',
    criticity: string = '',
    section: string = '',
  ) {
    const skip = (page - 1) * limit;
    let anomaly: any;
    const orderBy: any[] = [];

 if (order === 'LOW' || order === 'HIGH') {
    orderBy.push({
      sorting: order === 'LOW' ? 'asc' : 'desc'
    });
  }
  orderBy.push({ 
    status: 'desc' 
  });
    const whereClause: any = {};
    if (status && status.trim() !== '') {
      const validStatuses = ['NEW', 'IN_PROGRESS', 'CLOSED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        throw new Error(
          `Invalid status provided. Valid statuses are: ${validStatuses.join(', ')}`,
        );
      }
      whereClause.status = status;
    }
    if (criticity && criticity.trim() !== '') {
      switch (criticity.toUpperCase()) {
        case 'LOW':
          whereClause.criticite = {
            in: ['0', '1', '2', '3', '4', '5'], // Specific values
          };
          break;
        case 'MEDIUM':
          whereClause.criticite = {
            in: ['5', '6', '7', '8', '9', '10'],
          };
          break;
        case 'HIGH':
          whereClause.criticite = {
            in: ['10', '11', '12', '13', '14', '15'],
          };
          break;
        default:
          whereClause.criticite = criticity;
      }
    }
    if (section && section.trim() !== '') {
      const validSections = ['MC', 'MM', 'MD', 'CT', 'EL'];
      if (!validSections.includes(section.toUpperCase())) {
        throw new Error(
          `Invalid section provided. Valid sections are: ${validSections.join(', ')}`,
        );
      }
      whereClause.section = section;
    }
    anomaly = await this.Prisma.anomaly.findMany({
      skip: skip,
      take: limit,
      where: whereClause,
      orderBy: orderBy,
    });
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
    const sorting = parseInt(filteredData.criticite)
    const anomaly = await this.Prisma.anomaly.create({
      data: {
        ...filteredData,
        sorting: sorting || 0, 
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
        file_path: file.filePath,
        file_name: file.fileName,
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
    const maintenanceWindows = await this.Prisma.maintenance_window.findMany(
      {
        include:{
          anomaly: true,
        }
      }
    );
    if (!maintenanceWindows || maintenanceWindows.length === 0) {
      return { message: 'No maintenance windows found' };
    }
    return maintenanceWindows;
  }

  async markAsResolved(id: string) {
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
        maintenance_window: {
          disconnect: true,
        },
      },
    });
    return {
      success: true,
      message: 'Anomaly marked as resolved',
      data: updatedAnomaly,
    };
  }

  async attachRexEntry(id: string, file: any, summary?: string) {
    // Validate that either file or summary is provided
    if (!file && !summary?.trim()) {
      throw new Error('Either file or summary must be provided');
    }

    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: id },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    // Check if REX entry already exists for this anomaly
    const existingRex = await this.Prisma.rex_entrie.findFirst({
      where: { anomalies_id: id },
    });

    const rexData = {
      summary: summary || 'No summary provided',
      docment_path: file?.path || null,
      anomalies_id: id,
    };

    let rexEntry;
    if (existingRex) {
      // Update existing REX entry
      rexEntry = await this.Prisma.rex_entrie.update({
        where: { id: existingRex.id },
        data: rexData,
      });
    } else {
      // Create new REX entry
      rexEntry = await this.Prisma.rex_entrie.create({
        data: rexData,
      });
    }

    return {
      success: true,
      message: 'REX entry saved successfully',
      data: rexEntry,
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
        sorting: body.criticite ? parseInt(body.criticite) : anomaly.sorting,
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
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
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
    if (anomaly.required_stoping === true && anomaly.duree_intervention !== '0') {
      const maintenanceWindow = await this.anomalyToMaintenanceWindow(id);
      if (!maintenanceWindow.success) {
        return {
          success: false,
          message: maintenanceWindow.message,
          updatedAnomaly: maintenanceWindow.updatedAnomaly,
        };
      }
      return {
        success: true,
        message: 'Anomaly resolved successfully',
        updatedAnomaly: maintenanceWindow.updatedAnomaly,
        maintenanceWindow: maintenanceWindow.maintenanceWindow,
      };
    }
    return {
      success: true,
      message: 'Anomaly marked as treated successfully',
      updatedAnomaly: anomaly,
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

      const today = new Date();
      today.setHours(0, 0, 0, 0); 
    const requiredHours = this.extractHours(anomaly.duree_intervention || '0');
    const maintenanceWindows = await this.Prisma.maintenance_window.findMany({
      where: {
        titlte: {
          not: 'ORPHANS',
        },
        date_debut_arret: {
          gte: today, 
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
      let orphans = await this.Prisma.maintenance_window.findFirst({
        where: { titlte: 'ORPHANS' },
      });
      if (!orphans) {
        orphans = await this.Prisma.maintenance_window.create({
          data: {
            titlte: 'ORPHANS',
          },
        });
      }
      const updatedAnomaly = await this.Prisma.anomaly.update({
        where: { id: anomalyId },
        data: {
          maintenance_window: {
            connect: { id: orphans.id },
          },
        },
      });
      return {
        success: false,
        message: 'No suitable maintenance window found, assigned to ORPHANS',
        updatedAnomaly: updatedAnomaly,
      };
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
      let orphans = await this.Prisma.maintenance_window.findFirst({
        where: { titlte: 'ORPHANS' },
      });
      if (!orphans) {
        orphans = await this.Prisma.maintenance_window.create({
          data: {
            titlte: 'ORPHANS',
          },
        });
      }
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (const anom of anomaly) {
        try {
          const requiredHours = this.extractHours(
            anom.duree_intervention || '0',
          );

          const suitableWindow = maintenance_window
            .filter((w) => {
              const windowHours = this.extractHours(w.duree_heure || '0');
              const startDate = new Date(w.date_debut_arret);
              return windowHours >= requiredHours && startDate >= today;
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
            await this.Prisma.anomaly.update({
              where: { id: anom.id },
              data: {
                maintenance_window: { connect: { id: orphans.id } },
              },
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
  async deleteMaintenanceWindow(id: string) {
    const maintenanceWindow = await this.Prisma.maintenance_window.findUnique({
      where: { id: id },
    });
    if (!maintenanceWindow) {
      throw new Error('Maintenance window not found');
    }
    await this.Prisma.maintenance_window.delete({
      where: { id: id },
    });
    const assign =  this.autoAssigmentAnomalyToMaintenanceWindowForceStop();
    if (!assign) {
      throw new Error(`Failed to reassign anomalies`);
    }

    return {
      success: true,
      message: 'Maintenance window deleted successfully',
    };
  }

      async getActionPlans(anomalyId: string) {
    const anomaly = await this.Prisma.anomaly.findUnique({
      where: { id: anomalyId },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    const actionPlans = await this.Prisma.action_plan.findMany({
      where: { anomaly_id: anomalyId },
      orderBy: { id: 'asc' },
    });

    const total = await this.Prisma.action_plan.count({
      where: { anomaly_id: anomalyId },
    });

    return {
      data: actionPlans,
      total: total,
    };
  }


  
  async updateActionPlan(id: string){
    const actionplan = await this.Prisma.action_plan.findUnique({
      where: { id: id },
    });
    if (!actionplan) {
      throw new Error('Action plan not found');
    }
    let status ;
    if (actionplan.status === 'NOT_COMPLETED') {
      status = 'COMPLETED';
    } else if (actionplan.status === 'COMPLETED') {
      status = 'NOT_COMPLETED';
    }else
    {
      throw new Error('Action plan status is not valid for update');
    }
    const updatedActionPlan = await this.Prisma.action_plan.update({
      where: { id: id },
        data : {
            status: status
        }
    });
    return {
      success: true,
      message: 'Action plan updated successfully',
      data: updatedActionPlan,
    };
  }
  async deleteActionPlan(id: string) {
    const actionPlan = await this.Prisma.action_plan.findUnique({
      where: { id: id },
    });
    if (!actionPlan) {
      throw new Error('Action plan not found');
    }
    await this.Prisma.action_plan.delete({
      where: { id: id },
    });
    return {
      success: true,
      message: 'Action plan deleted successfully',
    };
  }



 

     async  downloadattachment(id: string) {
      const attachment = await this.Prisma.attachments.findUnique({
        where: { id: id },
      });
      if (!attachment) {
        throw new Error('Attachment not found');
      }
      if (!attachment.file_path) {
        throw new Error('File path not found for this attachment');
      }
      const filePath = path.resolve(attachment.file_path);
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found on server');
      }
      return {
        filePath: filePath,
        fileName: attachment.file_name || 'download',
        mimeType: this.getMimeType(attachment.file_name),
      };
    }

    async downloadrex(id: string) {
      const rex = await this.Prisma.rex_entrie.findUnique({
        where: { id: id },
      });
      if (!rex) {
        throw new Error('REX entry not found');
      }
      if (!rex.docment_path) {
        throw new Error('Document path not found for this REX entry');
      }
      const filePath = path.resolve(rex.docment_path);
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found on server');
      }

      // Extract actual filename from the file path
      const actualFileName = path.basename(rex.docment_path);

      return {
        filePath: filePath,
        fileName: actualFileName || 'rex-document', // Use actual filename from path
        mimeType: this.getMimeType(actualFileName), // Get MIME type from actual filename
      };
    }

    // Helper method to get MIME type
    private getMimeType(fileName: string): string {
      const ext = path.extname(fileName).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
      };
      return mimeTypes[ext] || 'application/octet-stream';
    }
  
    async checkaction(id :string)
    {
      const action = await this.Prisma.action_plan.findUnique({
        where: { id: id },
      });
      if (!action) {
        throw new Error('Action plan not found');
      }
      if (action.status === 'COMPLETED') {
        const res =  await this.Prisma.action_plan.update({
          where: { id: id },
          data: {
            status: 'NOT_COMPLETED',
          },
        });
        return {
          success: true,
          message: 'Action plan marked as not completed',
          data: res,
        };
      }
      if (action.status === 'NOT_COMPLETED') {
        const res =  await this.Prisma.action_plan.update({
          where: { id: id },
          data: {
            status: 'COMPLETED',
          },
        });
        return {
          success: true,
          message: 'Action plan marked as completed',
          data: res,
        };
      }
      throw new Error('Action plan status is not valid for update');
    }


    async deleteAction(id: string) {
      const action = await this.Prisma.action_plan.findUnique({
        where: { id: id },
      });
      if (!action) {
        throw new Error('Action plan not found');
      }

      await this.Prisma.action_plan.update({
        where: { id: id },
        data: {
          anomaly: {
            disconnect: true,
          },
        },
      });
      // Optionally, delete the file from the server if it exists
      await this.Prisma.action_plan.delete({
        where: { id: id },
      });
      return {
        success: true,
        message: 'Action plan deleted successfully',
      };
    }

    async deleteAttachment(id : string) {
      const attachment = await this.Prisma.attachments.findUnique({
        where: { id: id },
      });
      if (!attachment) {
        throw new Error('Attachment not found');
      }
   
      await this.Prisma.attachments.update({
        where: { id: id },
        data: {
          anomaly: {
            disconnect: true,
          },
        },
      });
      if (attachment.file_path) {
        const filePath = path.resolve(attachment.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await this.Prisma.attachments.delete({
        where: { id: id },
      });
      return {
        success: true,
        message: 'Attachment deleted successfully',
      };
    }

    async deleteAnomaly(id :string){
      const anomaly = await this.Prisma.anomaly.findUnique({
        where: { id: id },
      });
      if (!anomaly) {
        throw new Error('Anomaly not found');
      }
      await this.Prisma.anomaly.update({
        where: { id: id },
        data: { 
          maintenance_window: {
            disconnect: true,
          },
        },
      });
      await this.Prisma.anomaly.delete({
        where: { id: id },
      });
      return {
        success: true,
        message: 'Anomaly deleted successfully',
      };
    }


    async deleteRexEntry(id: string) {
      const rexEntry = await this.Prisma.rex_entrie.findUnique({
        where: { id: id },
      });
      if (!rexEntry) {
        throw new Error('REX entry not found');
      }
      await this.Prisma.rex_entrie.delete({
        where: { id: id },
      });
      if (rexEntry.docment_path) {
        const filePath = path.resolve(rexEntry.docment_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return {
        success: true,
        message: 'REX entry deleted successfully',
      };
    }

  }

