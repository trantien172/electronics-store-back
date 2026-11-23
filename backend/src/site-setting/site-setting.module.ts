import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSetting } from './entity/Site-setting.entity';
import { SiteSettingService } from './site-setting.service';
import { SiteSettingController } from './site-setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting])],
  controllers: [SiteSettingController],
  providers: [SiteSettingService],
  exports: [SiteSettingService], // Export để các module khác gọi getValue()
})
export class SiteSettingModule {}