import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repair } from './entity/Repair.entity';
import { RepairItem } from './entity/RepairItem.entity';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';
import { Service } from 'src/product/entity/Service.entity';
import { RepairItemProduct } from './entity/RepairItemProduct.entity';
import { RepairItemQuote } from './entity/RepairItemQuote.entity';
import { RepairItemQuoteLine } from './entity/RepairItemQuoteLine.entity';
import { RepairStatusHistory } from './entity/RepairStatusHistory.entity';
import { Category } from '../product/entity/Category.entity';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Repair, RepairItem, Service, RepairItemProduct, RepairItemQuote, RepairItemQuoteLine, RepairStatusHistory, Category])],
  controllers: [RepairController],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairModule {}
