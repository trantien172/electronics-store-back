import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  oldProductId?: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  price: string;

  @IsOptional()
  @IsInt()
  warrantyMonths?: number;

  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;
}