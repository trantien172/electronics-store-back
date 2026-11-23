import { IsEnum, IsOptional, IsBoolean, IsNumber, IsString, IsArray } from "class-validator";
import { Type, Transform } from "class-transformer";

export class FilterProductsDto {
    @IsOptional()
    @IsString() // Tên sản phẩm thường là chuỗi
    name?: string; 
    
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    @Transform(({ value }) => (Array.isArray(value) ? value : [Number(value)]))
    brandsId?: number[];

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    @Transform(({ value }) => (Array.isArray(value) ? value : [Number(value)]))
    categoryId?: number[];

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    manufactureYear?: number;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean) // Quan trọng để chuyển "true" -> true
    isActive?: boolean;
    
    @IsOptional()
    @IsString()
    model?: string;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxBasePrice?: number;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minBasePrice?: number;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxSellingPrice?: number;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minSellingPrice?: number;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    quantity?: number;
    
    @IsOptional()
    @IsEnum(['old', 'new', 'both'])
    type?: string;
    
    @IsOptional()
    @IsString()
    conditionStatus?: string;
    
    @IsOptional()
    @IsString()
    oldProductStatus?: string;

    @IsOptional() @Type(() => Number) @IsNumber() page?: number;
    @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
}
