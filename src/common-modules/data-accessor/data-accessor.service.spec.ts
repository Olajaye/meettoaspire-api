import { Test, TestingModule } from '@nestjs/testing';
import { DataAccessorService } from './data-accessor.service';

describe('DataAccessorService', () => {
  let service: DataAccessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataAccessorService],
    }).compile();

    service = module.get<DataAccessorService>(DataAccessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
