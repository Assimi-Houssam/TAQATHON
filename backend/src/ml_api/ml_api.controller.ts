import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { MlApiService } from './ml_api.service';
import { Public } from 'src/metadata';
import { CreateAnomalieDto } from 'src/anomaly/dto/anomalie.dto';
import { PrioritySuggestionDto } from './dto/prioritysuggestion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('ml')
export class MlApiController {
  constructor(private readonly mlApiService: MlApiService) {}


  @Post('suggestPriority')
  async SuggestPriority(@Body() data : PrioritySuggestionDto) {

    // send data to fastapi for estimation of  priotite
    // receive data from fastapi send it to front 
    const response = await this.mlApiService.sendPriorityRequest(data);
    return response;

  }


  @Post('uploadanomalies')
  @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads/resolved',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `resolved-${uniqueSuffix}${ext}`;
            callback(null, filename);
          },
        }),
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      }),
    )
    async uploadAnomaly(file : any) {
      const sending =  await this.mlApiService.sendAnomalyFile(file);

      if(!sending){
        throw new Error('Failed to send anomaly file to FastAPI');
      }

      return sending
    }
  

      @Public()
      @Post('receive-fastapi-response')
      async receiveFastApiResponse(data: CreateAnomalieDto) {
        return { message: 'Data received successfully', data };
      }
}
