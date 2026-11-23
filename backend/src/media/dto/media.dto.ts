import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadMediaDto {
  @IsEnum([
    'product',
    'old_product',
    'repair_item',
    'user',
    'site',
    'category',
    'brand',
  ])
  entityType:
    | 'product'
    | 'old_product'
    | 'repair_item'
    | 'user'
    | 'site'
    | 'category'
    | 'brand';

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsOptional()
  @IsEnum(['image', 'audio', 'video', 'document'])
  fileType?: 'image' | 'audio' | 'video' | 'document';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPrimary?: boolean;
}

export class QueryMediaDto {
  @IsEnum([
    'product',
    'old_product',
    'repair_item',
    'user',
    'site',
    'category',
    'brand',
  ])
  entityType:
    | 'product'
    | 'old_product'
    | 'repair_item'
    | 'user'
    | 'site'
    | 'category'
    | 'brand';

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsOptional()
  @IsEnum(['image', 'audio', 'video', 'document'])
  fileType?: 'image' | 'audio' | 'video' | 'document';
}