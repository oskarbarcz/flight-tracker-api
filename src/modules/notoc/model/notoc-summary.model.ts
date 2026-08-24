import { ApiProperty } from '@nestjs/swagger';
import { ColdChainRisk } from '../../cargo/model/cold-chain';

export class NotocStageState {
  @ApiProperty({
    description: 'Whether the notification for this stage has been issued',
    example: true,
  })
  issued!: boolean;

  @ApiProperty({
    description: 'Whether the pilot has accepted it',
    example: false,
  })
  acknowledged!: boolean;
}

export class FlightNotocSummary {
  @ApiProperty({ example: 2 })
  dangerousGoodsCount!: number;

  @ApiProperty({
    description: 'Dangerous goods restricted to a cargo aircraft',
    example: 0,
  })
  cargoAircraftOnlyCount!: number;

  @ApiProperty({
    description:
      'Loads that must be declared without being dangerous goods, such as live animals or valuables',
    example: 3,
  })
  specialLoadCount!: number;

  @ApiProperty({ enum: ColdChainRisk, nullable: true })
  worstColdChainRisk!: ColdChainRisk | null;

  @ApiProperty({ type: NotocStageState })
  preliminary!: NotocStageState;

  @ApiProperty({ type: NotocStageState })
  final!: NotocStageState;
}
