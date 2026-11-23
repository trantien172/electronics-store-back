import { Module } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { WarrantyController } from './warranty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warranty } from './entity/Warranty.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Warranty])
  ],
  controllers: [WarrantyController],
  providers: [WarrantyService],
})
export class WarrantyModule {}
