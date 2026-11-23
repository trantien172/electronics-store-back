import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../user/enum/role.enum';
import { WarrantyService } from './warranty.service';

class CreateWarrantyDto {
  @IsOptional() @IsInt() @Min(1) repairItemId?: number;
  @IsOptional() @IsString() repairItemProductId?: string;
  @IsOptional() @IsString() orderItemId?: string;
  @IsInt() @Min(1) customerId: number;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
class UpdateWarrantyDto { @IsOptional() @IsIn(['active','expired','claimed','void']) status?: string; @IsOptional() @IsString() @MaxLength(2000) note?: string; }

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('warranties')
export class WarrantyController {
  constructor(private readonly service: WarrantyService) {}
  @Post() @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) create(@Body() dto: CreateWarrantyDto) { return this.service.create(dto); }
  @Get('stats') @Roles(Role.ADMIN, Role.OWNER) stats() { return this.service.getStats(); }
  @Get('my') @Roles(Role.CLIENT) mine(@Req() req: any) { return this.service.findByCustomer(req.user.userId); }
  @Get() @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) all(@Query('customerId') customerId?: number, @Query('status') status?: string) { return this.service.findAll(customerId, status); }
  @Get(':id') detail(@Param('id', ParseIntPipe) id: number, @Req() req: any) { return this.service.findOneForUser(id, req.user); }
  @Patch(':id') @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarrantyDto) { return this.service.update(id, dto); }
  @Patch(':id/void') @Roles(Role.ADMIN, Role.OWNER) void(@Param('id', ParseIntPipe) id: number, @Body('note') note?: string) { return this.service.voidWarranty(id, note); }
}
