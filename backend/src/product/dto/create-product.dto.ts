import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    categoryId: string

    @IsString()
    model: string;

    @IsOptional()
    @IsNumber()
    manualFactureYear?: number;

    @IsNumber()
    basePrice: number;

    @IsNumber()
    sellingPrice: number;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsNumber()
    warrantyMonths?: number;

    @IsOptional()
    @IsString()
    description?: string;
}
