import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AnomalyService } from './anomaly.service';
import { Public } from '../metadata';

@Controller('anomaly')
export class AnomalyController {
  constructor(private readonly anomalyService: AnomalyService
  ) {}



  @Get('getAnomaly')
  async getAnomaly() {
    return await this.anomalyService.getAnomaly();
  }

  @Get('getAnomalyById/:id')
  async getAnomalyById(id: string)
  {
    return 1
  }
  

  @Post('suggestPriority')
  async SuggestPriority() {

    // send data to fastapi for estimation of  priotite
    // receive data from fastapi send it to front 

    // return await this.anomalyService.createAnomaly();
    return 1 
  }

  @Post('createAnomaly')
  async createAnomaly() {
    // save anomaly from  front end to db 

    return 1
  }

  @Post('uploadAnomaly')
  async uploadAnomaly() {
    // upload anomaly from front  end send it to  fast api  

    return 1
  }

  @Public()
  @Post('receive-fastapi-response')
  async receiveFastApiResponse(data: any) {
    // Handle the response from FastAPI
    console.log('Received data from FastAPI:', data);
    // Process the data as needed
    return { message: 'Data received successfully', data };
  }


  @Post('attachment/:id')
  async uploadAttachment(@Param('id') id: string) {
    // upload attachment to anomaly 
    // save it to db 
    return 1
  }

  @Post('mark_as_resolved/:id')
  async markAsResolved(@Param('id') id: string, @Body() body: any) {
    // Mark the anomaly as resolved in the database
    return 1
  }

  @Patch('updateAnomaly/:id')
  async updateAnomaly(@Param('id') id: string, @Body() body: any) {
    // Update the anomaly in the database
    return 1  
  }

}
