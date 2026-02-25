import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiTags('operator rotations')
@Controller('/api/v1/operator/:operatorId/rotation')
export class RotationController {}
