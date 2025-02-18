import { Test, TestingModule } from '@nestjs/testing';
import { DataAccessorController } from './data-accessor.controller';

describe('DataAccessorController', () => {
  let controller: DataAccessorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataAccessorController],
    }).compile();

    controller = module.get<DataAccessorController>(DataAccessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
