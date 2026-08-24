import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { NotocStageName } from '../../../model/notoc.model';

export class NotocFilters {
  @ApiPropertyOptional({
    description:
      'Loadsheet stage to read; omit to take the latest issued notification',
    enum: NotocStageName,
    example: NotocStageName.Preliminary,
  })
  @IsOptional()
  @IsEnum(NotocStageName)
  stage?: NotocStageName;
}
