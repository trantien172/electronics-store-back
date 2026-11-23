import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { CreateRepairDto } from './create-repair.dto';

export class UpdateRepairDto extends PartialType(CreateRepairDto) {
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  cost?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;
}