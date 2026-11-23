import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {User} from './entity/User.entity';
import { CustomerProfile } from './entity/CustomerProfile.entity';
import { StaffProfile } from './entity/StaffProfile.entity';
import { AuthIdentity } from './entity/AuthIdentity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CustomerProfile, StaffProfile, AuthIdentity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
