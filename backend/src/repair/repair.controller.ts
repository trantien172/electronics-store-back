import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsString, Length, Matches, MaxLength, Min, ValidateNested } from 'class-validator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guard/optional-jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../user/enum/role.enum';
import { AuthService } from '../auth/auth.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { RepairService } from './repair.service';

class TrackDto { @IsString() @Length(8,30) code: string; @IsString() @Length(7,20) phone: string; @IsString() @Length(6,6) otp: string; }
class QuickLookupDto { @IsString() @Matches(/^0\d{9}$/) phone: string; @IsOptional() @IsString() @Length(6,6) otp?: string; }
class StatusDto { @IsString() @IsIn(['pending','in_progress','completed','cancelled']) status: string; @IsOptional() @IsString() @MaxLength(2000) note?: string; }
class ItemStatusDto { @IsString() @IsIn(['pending','assigned','in_progress','waiting_parts','waiting_quote','completed','cancelled']) status: string; @IsOptional() @IsString() @MaxLength(2000) note?: string; }
class QuoteLineDto { @IsString() @Length(1,255) description: string; @Type(() => Number) @IsNumber() @Min(0.01) quantity: number; @Type(() => Number) @IsNumber() @Min(0) unitPrice: number; }
class CreateQuoteDto { @IsOptional() @IsString() @MaxLength(2000) reason?: string; @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => QuoteLineDto) lines: QuoteLineDto[]; }
class RespondQuoteDto { @IsIn(['accepted','rejected']) action: 'accepted' | 'rejected'; @IsOptional() @IsString() @MaxLength(2000) note?: string; }

@Controller('repair')
export class RepairController {
  constructor(private readonly repairs: RepairService, private readonly auth: AuthService) {}
  @UseGuards(OptionalJwtAuthGuard) @Post() create(@Body() dto: CreateRepairDto, @Req() req: any) { return this.repairs.create(dto, req.user); }
  @UseGuards(JwtAuthGuard, RoleGuard) @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) @Post('at-counter')
  createAtCounter(@Body() dto: CreateRepairDto, @Req() req: any) { return this.repairs.createAtCounter(dto, req.user); }
  @UseGuards(OptionalJwtAuthGuard) @Post('quick-lookup')
  quickLookup(@Body() dto: QuickLookupDto, @Req() req: any) { return this.repairs.quickLookup(dto.phone, dto.otp, req.user); }
  @Post('track') async track(@Body() dto: TrackDto) { await this.auth.verifyOtp(dto.phone, dto.otp, 'repair'); return this.repairs.track(dto.code, dto.phone); }
  @UseGuards(JwtAuthGuard) @Get('my') my(@Req() req: any) { return this.repairs.listMine(req.user.userId); }
  @UseGuards(JwtAuthGuard) @Get('code/:code') detailByCode(@Param('code') code: string, @Req() req: any) { return this.repairs.getByCodeForCustomer(code, req.user); }
  @UseGuards(JwtAuthGuard, RoleGuard) @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) @Get()
  list(@Query('status') status?: string, @Query('page', new ParseIntPipe({ optional: true })) page = 1, @Query('limit', new ParseIntPipe({ optional: true })) limit = 20) {
    return this.repairs.listAll(status, Math.max(1, page), Math.min(100, Math.max(1, limit)));
  }
  @UseGuards(JwtAuthGuard) @Get(':id') detail(@Param('id', ParseIntPipe) id: number, @Req() req: any) { return this.repairs.getForCustomer(id, req.user); }
  @UseGuards(JwtAuthGuard, RoleGuard) @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: StatusDto, @Req() req: any) { return this.repairs.updateStatus(id, dto.status, req.user.userId, dto.note); }
  @UseGuards(JwtAuthGuard, RoleGuard) @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) @Patch('items/:itemId/status')
  updateItemStatus(@Param('itemId', ParseIntPipe) itemId: number, @Body() dto: ItemStatusDto, @Req() req: any) { return this.repairs.updateItemStatus(itemId, dto.status, req.user.userId, dto.note); }
  @UseGuards(JwtAuthGuard, RoleGuard) @Roles(Role.WORKER, Role.ADMIN, Role.OWNER) @Post('items/:itemId/quotes')
  createQuote(@Param('itemId', ParseIntPipe) itemId: number, @Body() dto: CreateQuoteDto, @Req() req: any) { return this.repairs.addQuote(itemId, req.user.userId, dto); }
  @UseGuards(JwtAuthGuard) @Post('quotes/:quoteId/respond')
  respondQuote(@Param('quoteId') quoteId: string, @Body() dto: RespondQuoteDto, @Req() req: any) { return this.repairs.respondToQuote(quoteId, req.user.userId, dto.action, dto.note); }
}
