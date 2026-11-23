import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateWarrantyDto {
  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  oldProductId?: number;

  @IsOptional()
  @IsInt()
  repairId?: number;

  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsInt()
  customerId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}