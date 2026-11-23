// dto/filter-old-product.dto.ts
import { IsOptional, IsString, IsNumber,  } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterOldProductDto {
  @IsOptional()
  @IsString()
  name?: string; // Tìm theo tên máy

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category_id?: number; // Lọc theo loại (iPhone, Samsung, Laptop...)

  @IsOptional()
  @IsString()
  appearance_condition?: string; // Lọc theo độ mới (99%, Like New...)

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min_price?: number; // Giá thấp nhất

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max_price?: number; // Giá cao nhất
}