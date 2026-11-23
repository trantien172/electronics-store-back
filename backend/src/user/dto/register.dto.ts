import { IsString, IsNotEmpty, MinLength, IsPhoneNumber, IsOptional, IsEmail } from 'class-validator';

export class RegisterDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;
  
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  
  @IsOptional()
  @IsString()
  role?: string; // optional, mặc định là 'user'

  @IsString()
  address?: string;

  @IsEmail()
  email?: string;
}