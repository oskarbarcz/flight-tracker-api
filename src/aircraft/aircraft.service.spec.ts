import { Test, TestingModule } from '@nestjs/testing';
import { AircraftService } from './aircraft.service';

describe('AircraftService', () => {
  let service: AircraftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AircraftService],
    }).compile();

    service = module.get<AircraftService>(AircraftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
