import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  settingKey: string;

  @IsOptional()
  @IsString()
  settingValue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  settingValue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

// Dùng để update nhiều setting cùng lúc
export class BulkUpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  settingKey: string;

  @IsOptional()
  @IsString()
  settingValue?: string;
}