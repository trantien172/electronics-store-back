// create-service.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ each: true })
  @IsOptional()
  productIds?: number[]; // Mảng ID của các sản phẩm muốn liên kết (nếu có)
}

