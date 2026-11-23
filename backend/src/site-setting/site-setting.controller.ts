import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SiteSettingService } from './site-setting.service';
import {
  CreateSettingDto,
  UpdateSettingDto,
  BulkUpdateSettingDto,
} from './dto/site-settings.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../user/enum/role.enum';

@Controller('site-setting')
@UseGuards(JwtAuthGuard, RoleGuard)
export class SiteSettingController {
  constructor(private readonly siteSettingsService: SiteSettingService) {}

  // POST /site-settings
  @Post()
  @Roles(Role.OWNER)
  create(@Body() dto: CreateSettingDto, @Request() req) {
    return this.siteSettingsService.create(dto, req.user.userId);
  }

  // GET /site-settings — public, client cũng xem được (logo, tên shop, v.v.)
  @Get()
  findAll() {
    return this.siteSettingsService.findAll();
  }

  // GET /site-settings/:key
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.siteSettingsService.findByKey(key);
  }

  // PATCH /site-settings/:key
  @Patch(':key')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @Request() req,
  ) {
    return this.siteSettingsService.update(key, dto, req.user.userId);
  }

  // PATCH /site-settings — bulk update nhiều setting cùng lúc
  @Patch()
  @Roles(Role.OWNER, Role.ADMIN)
  bulkUpdate(@Body() items: BulkUpdateSettingDto[], @Request() req) {
    return this.siteSettingsService.bulkUpdate(items, req.user.userId);
  }

  // DELETE /site-settings/:key
  @Delete(':key')
  @Roles(Role.OWNER)
  delete(@Param('key') key: string) {
    return this.siteSettingsService.delete(key);
  }
}