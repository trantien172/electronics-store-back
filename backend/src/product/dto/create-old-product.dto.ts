import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum} from "class-validator";



export class CreateOldProductDto {
    @IsString()
    serialNumber: string;

    @IsNumber()
    productId: number;

    @IsEnum(["like_new", "used", "broken"])
    conditionStatus: string;

    @IsOptional()
    warrantyMonths?: number;

    @IsEnum(["available", "reserved", "sold", "in_repair"])
    status: string;

    @IsString()
    notes: string;

    @IsNumber()
    basePrice: number;

    @IsOptional()
    @IsNumber()
    sellingPrice?: number;
}
