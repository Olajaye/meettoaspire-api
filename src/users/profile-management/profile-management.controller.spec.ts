import { Test, TestingModule } from '@nestjs/testing';
import { ProfileManagementController } from './profile-management.controller';

describe('ProfileManagementController', () => {
  let controller: ProfileManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileManagementController],
    }).compile();

    controller = module.get<ProfileManagementController>(ProfileManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
