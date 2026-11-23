import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateWarrantyDto } from './create-warranty.dto';

export class UpdateWarrantyDto extends PartialType(CreateWarrantyDto) {
  @IsOptional()
  @IsEnum(['active', 'expired', 'void'])
  status?: 'active' | 'expired' | 'void';

  @IsOptional()
  @IsString()
  notes?: string;
}