import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewingAppointment } from './entity/ViewingAppointment.entity';
import { OldProduct } from '../product/entity/OldProduct.entity';

@Injectable()
export class AppointmentService {
  constructor(@InjectRepository(ViewingAppointment) private readonly repo: Repository<ViewingAppointment>, @InjectRepository(OldProduct) private readonly oldProducts: Repository<OldProduct>) {}
  async create(customerId: number, input: any) {
    const scheduled = new Date(input.scheduledAt);
    const createdAt = new Date();
    const oldProduct = await this.oldProducts.findOneBy({ id: input.oldProductId });
    if (!oldProduct || oldProduct.status !== 'available') throw new NotFoundException('Used appliance is not available for an appointment');
    if (scheduled <= createdAt || scheduled.getTime() > createdAt.getTime() + 24 * 60 * 60 * 1000) throw new NotFoundException('Select a viewing time within the next 24 hours');
    const row = this.repo.create({ ...input, customerId, scheduledAt: scheduled, expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000), status: 'PENDING' });
    return this.repo.save(row);
  }
  list(customerId: number) { return this.repo.find({ where: { customerId }, order: { createdAt: 'DESC' } }); }
  async get(customerId: number, id: string) { const row = await this.repo.findOne({ where: { id, customerId } }); if (!row) throw new NotFoundException('Appointment not found'); return row; }
}
