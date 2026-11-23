import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { IsDateString, IsEmail, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserService } from './user.service';

class UpdateProfileDto {
  @IsOptional() @IsString() @Length(2,100) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(255) address?: string;
  @IsOptional() @IsDateString() birthday?: string;
}
class ChangePasswordDto { @IsString() currentPassword: string; @IsString() @MinLength(8) newPassword: string; }

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly users: UserService) {}
  @Get('me') me(@Req() req: any) { return this.users.getOwnProfile(req.user.userId); }
  @Patch('me') update(@Req() req: any, @Body() dto: UpdateProfileDto) { return this.users.updateOwnProfile(req.user.userId, dto); }
  @Patch('me/password') changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) { return this.users.changeOwnPassword(req.user.userId, dto.currentPassword, dto.newPassword); }
}
