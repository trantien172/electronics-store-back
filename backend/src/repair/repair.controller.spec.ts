import { Test, TestingModule } from '@nestjs/testing';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';

describe('RepairController', () => {
  let controller: RepairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairsController],
      providers: [RepairsService],
    }).compile();

    controller = module.get<RepairController>(RepairsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
