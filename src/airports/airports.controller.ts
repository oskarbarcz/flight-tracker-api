import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AirportsService } from './airports.service';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { uuid } from '../common/validation/uuid.param';
import { Airport } from './entities/airport.entity';

@Controller('api/v1/airport')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @Post()
  async create(@Body() createAirportDto: CreateAirportDto): Promise<Airport> {
    return this.airportsService.create(createAirportDto);
  }

  @Get()
  async findAll(): Promise<Airport[]> {
    return this.airportsService.findAll();
  }

  @Get(':id')
  async findOne(@uuid('id') id: string): Promise<Airport> {
    return this.airportsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @uuid('id') id: string,
    @Body() updateAirportDto: UpdateAirportDto,
  ): Promise<Airport> {
    return this.airportsService.update(id, updateAirportDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@uuid('id') id: string): Promise<void> {
    return this.airportsService.remove(id);
  }
}
