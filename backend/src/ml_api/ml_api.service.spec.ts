import { Test, TestingModule } from '@nestjs/testing';
import { MlApiService } from './ml_api.service';

describe('MlApiService', () => {
  let service: MlApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MlApiService],
    }).compile();

    service = module.get<MlApiService>(MlApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
