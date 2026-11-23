import { IsPhoneNumber } from 'class-validator'

export class PhoneDto {
    @IsPhoneNumber('VN')
    phone!: string;

    region?: string;
}