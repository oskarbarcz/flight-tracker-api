import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AircraftService } from './aircraft.service';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';
import { Aircraft } from './entities/aircraft.entity';

@Controller('/api/v1/aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @Post()
  async create(
    @Body() createAircraftDto: CreateAircraftDto,
  ): Promise<Aircraft> {
    return await this.aircraftService.create(createAircraftDto);
  }

  @Get()
  async findAll(): Promise<Aircraft[]> {
    return this.aircraftService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Aircraft> {
    return this.aircraftService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAircraftDto: UpdateAircraftDto,
  ): Promise<Aircraft> {
    return this.aircraftService.update(id, updateAircraftDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.aircraftService.remove(id);
  }
}
