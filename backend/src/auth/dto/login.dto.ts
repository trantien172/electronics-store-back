import { IsString, IsNotEmpty, IsPhoneNumber  } from 'class-validator';


export class LoginDto {
    @IsPhoneNumber('VN')
    phone!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}