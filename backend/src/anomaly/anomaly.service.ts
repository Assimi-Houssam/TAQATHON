import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AnomalyService {
    constructor(private readonly Prisma: PrismaService) {}

    async getAnomaly() {
        const anomaly = await this.Prisma.anomaly.findMany()
        if (!anomaly || anomaly.length === 0) {
            return { message: 'No anomalies found' };
        }
        return anomaly;
    }   
}
