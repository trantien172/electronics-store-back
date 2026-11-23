import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsOptional, IsString, Length, MaxLength, ValidateNested } from 'class-validator';
import { CreateRepairItemDto } from './create-repair-item.dto';

export class CreateRepairDto {
  @IsString() @Length(7, 20) contact: string;
  @IsOptional() @IsString() @Length(2, 100) name?: string;
  @IsOptional() @IsString() @MaxLength(255) visitAddress?: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
  @IsOptional() @IsString() otp?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CreateRepairItemDto) repairItems: CreateRepairItemDto[];
}
