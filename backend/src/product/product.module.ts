import { Module, ConflictException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthModule } from '../auth/auth.module';
import { Category } from './entity/Category.entity';
import { OldProduct } from './entity/OldProduct.entity';
import { Product } from './entity/Product.entity';
import { Brand } from './entity/Brand.entity';
import { Service } from './entity/Service.entity'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Brand, Category, OldProduct, Product, Service])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
