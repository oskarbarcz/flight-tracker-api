import { Test, TestingModule } from '@nestjs/testing';
import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';

describe('AircraftController', () => {
  let controller: AircraftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AircraftController],
      providers: [AircraftService],
    }).compile();

    controller = module.get<AircraftController>(AircraftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
