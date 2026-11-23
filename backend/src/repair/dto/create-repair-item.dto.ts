import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateRepairItemDto {
  @Type(() => Number) @IsInt() @Min(1) categoryId: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) serviceId?: number;
  @IsOptional() @IsString() @MaxLength(100) deviceModel?: string;
  @IsOptional() @IsString() @MaxLength(150) deviceSerial?: string;
  @IsOptional() @IsString() @MaxLength(255) accessories?: string;
  @IsOptional() @IsString() receivedCondition?: string;
  @IsString() @Length(5, 3000) problemDescription: string;
  @IsOptional() @IsIn(['AT_SHOP', 'AT_HOME']) serviceMode: 'AT_SHOP' | 'AT_HOME' = 'AT_SHOP';
}
