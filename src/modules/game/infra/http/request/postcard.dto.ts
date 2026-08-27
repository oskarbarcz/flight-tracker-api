import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

const SIZE_PATTERN = /^\d{3,4}x\d{3,4}$/;

export class RedrawPostcardRequest {
  @ApiProperty({
    description:
      'What to draw instead of the city name. The only way to give art to a city whose own name the generator will not accept. Does not rename the city.',
    required: false,
    example: 'Beijing China',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  drawnName?: string;

  @ApiProperty({
    description: 'WxH, both sides divisible by 16',
    required: false,
    example: '1152x1536',
  })
  @IsOptional()
  @Matches(SIZE_PATTERN)
  size?: string;

  @ApiProperty({
    required: false,
    enum: ['auto', 'low', 'medium', 'high'],
    example: 'high',
  })
  @IsOptional()
  @IsIn(['auto', 'low', 'medium', 'high'])
  quality?: 'auto' | 'low' | 'medium' | 'high';

  @ApiProperty({ required: false, enum: ['jpeg', 'png'], example: 'jpeg' })
  @IsOptional()
  @IsIn(['jpeg', 'png'])
  format?: 'jpeg' | 'png';
}
