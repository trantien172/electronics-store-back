import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewingAppointment } from './entity/ViewingAppointment.entity';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { OldProduct } from '../product/entity/OldProduct.entity';

@Module({ imports: [TypeOrmModule.forFeature([ViewingAppointment, OldProduct])], controllers: [AppointmentController], providers: [AppointmentService] })
export class AppointmentModule {}
