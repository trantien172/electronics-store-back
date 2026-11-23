import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

class PhoneOtpDto {
  @IsString() @Length(7, 20) phone: string;
  @IsIn(['register', 'reset', 'repair', 'google']) purpose: 'register' | 'reset' | 'repair' | 'google';
}
class VerifyOtpDto extends PhoneOtpDto { @IsString() @Length(6, 6) otp: string; }
class RegisterDto extends VerifyOtpDto { @IsString() @Length(2, 100) name: string; @IsString() @MinLength(8) password: string; }
class LoginDto { @IsString() phone: string; @IsString() password: string; }
class ResetDto extends VerifyOtpDto { @IsString() @MinLength(8) password: string; }
class GoogleCompleteDto { @IsString() ticket: string; @IsOptional() @IsString() @Length(7, 20) phone?: string; @IsOptional() @IsString() @Length(6, 6) otp?: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login') async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.loginWithPhone(dto.phone, dto.password);
    res.cookie('refresh_token', result.refresh_token, this.cookieOptions());
    return { user: result.user, access_token: result.access_token };
  }

  @Post('send-otp') sendOtp(@Body() dto: PhoneOtpDto) { return this.auth.sendOtp(dto.phone, dto.purpose); }
  @Get('google') google(@Res() res: Response) { return res.redirect(this.auth.googleAuthorizationUrl()); }
  @Get('google/callback') async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    const ticket = await this.auth.finishGoogleCallback(code, state);
    return res.redirect(`${process.env.CLIENT_WEB_URL || 'http://localhost:3000'}/google/complete?ticket=${encodeURIComponent(ticket)}`);
  }
  @Post('google/complete') async googleComplete(@Body() body: GoogleCompleteDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.completeGoogle(body.ticket, body.phone, body.otp);
    if ('needsPhoneVerification' in result) return result;
    res.cookie('refresh_token', result.refresh_token, this.cookieOptions());
    return { user: result.user, access_token: result.access_token };
  }
  @HttpCode(HttpStatus.OK) @Post('verify-otp') verifyOtp(@Body() dto: VerifyOtpDto) { return this.auth.verifyOtp(dto.phone, dto.otp, dto.purpose); }
  @Post('register') async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    res.cookie('refresh_token', result.refresh_token, this.cookieOptions());
    return { user: result.user, access_token: result.access_token };
  }
  @HttpCode(HttpStatus.OK) @Post('password-reset') reset(@Body() dto: ResetDto) { return this.auth.resetPassword(dto.phone, dto.otp, dto.purpose, dto.password); }
  @UseGuards(JwtAuthGuard) @Get('me') me(@Req() req: Request & { user: any }) { return this.auth.getPublicUser(req.user.userId); }

  @HttpCode(HttpStatus.OK) @Post('logout') async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req as any).cookies?.refresh_token;
    if (token) await this.auth.logout(token);
    res.clearCookie('refresh_token', this.cookieOptions());
    return { success: true };
  }
  @HttpCode(HttpStatus.OK) @Post('refresh') async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.refreshTokens((req as any).cookies?.refresh_token);
    res.cookie('refresh_token', result.refresh_token, this.cookieOptions());
    return { access_token: result.access_token };
  }
  private cookieOptions() { return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 7 * 86400000 }; }
}
