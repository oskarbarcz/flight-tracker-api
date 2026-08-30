import { IsEnum, IsOptional } from 'class-validator';
import { LoadsheetKind } from '../../../model/loadsheet.model';

export class LoadsheetListFilters {
  @IsOptional()
  @IsEnum(LoadsheetKind)
  type?: LoadsheetKind;
}
