import { Test, TestingModule } from '@nestjs/testing';
import { MlApiController } from './ml_api.controller';
import { MlApiService } from './ml_api.service';

describe('MlApiController', () => {
  let controller: MlApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MlApiController],
      providers: [MlApiService],
    }).compile();

    controller = module.get<MlApiController>(MlApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
