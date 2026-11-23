import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshStrategy } from './strategy/jwt-refresh.strategy';
import { RedisModule } from 'src/redis/redis.module'
import { MediaModule } from '../media/media.module'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthIdentity } from '../user/entity/AuthIdentity.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([AuthIdentity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    RedisModule,
    MediaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy]
})
export class AuthModule { }
