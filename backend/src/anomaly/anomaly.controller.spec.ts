import { Test, TestingModule } from '@nestjs/testing';
import { AnomalyController } from './anomaly.controller';
import { AnomalyService } from './anomaly.service';

describe('AnomalyController', () => {
  let controller: AnomalyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnomalyController],
      providers: [AnomalyService],
    }).compile();

    controller = module.get<AnomalyController>(AnomalyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
