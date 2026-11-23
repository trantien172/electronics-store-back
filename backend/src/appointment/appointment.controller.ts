import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { IsDateString, IsInt, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AppointmentService } from './appointment.service';

class CreateAppointmentDto {
  @IsInt() @Min(1) oldProductId: number;
  @IsDateString() scheduledAt: string;
  @IsString() @Length(2, 100) customerName: string;
  @IsString() @Length(7, 20) customerPhone: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
}
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}
  @Post() create(@Req() req: any, @Body() dto: CreateAppointmentDto) { return this.service.create(req.user.userId, dto); }
  @Get('my') list(@Req() req: any) { return this.service.list(req.user.userId); }
  @Get(':id') get(@Req() req: any, @Param('id') id: string) { return this.service.get(req.user.userId, id); }
}
