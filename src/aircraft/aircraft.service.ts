import { Injectable } from '@nestjs/common';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';

@Injectable()
export class AircraftService {
  create(createAircraftDto: CreateAircraftDto) {
    return 'This action adds a new aircraft';
  }

  findAll() {
    return `This action returns all aircraft`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aircraft`;
  }

  update(id: number, updateAircraftDto: UpdateAircraftDto) {
    return `This action updates a #${id} aircraft`;
  }

  remove(id: number) {
    return `This action removes a #${id} aircraft`;
  }
}
