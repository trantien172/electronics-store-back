import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import {ConfigModule, ConfigService} from '@nestjs/config'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { RedisModule } from './redis/redis.module';
import { ProductModule } from './product/product.module';
import { AiModule } from './ai/ai.module';
import { SiteSettingModule } from './site-setting/site-setting.module';
import { MediaModule } from './media/media.module';
import { OrderModule } from './order/order.module';
import { RepairModule } from './repair/repair.module';
import { WarrantyModule } from './warranty/warranty.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // hoặc 'postgres' tùy DB của bạn
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        migrations: [__dirname + '/database/migrations/*{.js,.ts}'],
        extra: {
        allowPublicKeyRetrieval: true,
        ssl: false,
      }
      })}),
    UserModule,
    AuthModule,
    RedisModule,
    ProductModule,
    WarrantyModule,
    RepairModule,
    OrderModule,
    MediaModule,
    SiteSettingModule,
    AiModule  

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
