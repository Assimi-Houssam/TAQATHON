import { Controller } from '@nestjs/common';
import { MlApiService } from './ml_api.service';

@Controller('ml')
export class MlApiController {
  constructor(private readonly mlApiService: MlApiService) {}
}
