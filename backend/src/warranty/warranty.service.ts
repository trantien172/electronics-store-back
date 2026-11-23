import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Warranty } from './entity/Warranty.entity';

@Injectable()
export class WarrantyService {
  constructor(@InjectRepository(Warranty) private readonly repo: Repository<Warranty>) {}
  async create(input: any) {
    const sources = [input.repairItemId, input.repairItemProductId, input.orderItemId].filter(value => value !== null && value !== undefined);
    if (sources.length !== 1) throw new BadRequestException('A warranty must reference exactly one repair item, installed part, or order item');
    if (new Date(input.endDate) < new Date(input.startDate)) throw new BadRequestException('Warranty end date must follow start date');
    return this.repo.save(this.repo.create({ ...input, status: 'active' }));
  }
  async findAll(customerId?: number, status?: string) {
    return this.repo.find({ where: { ...(customerId ? { customerId } : {}), ...(status ? { status: status as any } : {}) }, relations: { repairItem: { category: true, repair: true }, repairItemProduct: { product: true }, orderItem: { product: true, oldProduct: { product: true } } }, order: { startDate: 'DESC' } });
  }
  findByCustomer(customerId: number) { return this.findAll(customerId); }
  async findOne(id: number) {
    const warranty = await this.repo.findOne({ where: { id }, relations: { repairItem: { category: true, repair: true }, repairItemProduct: { product: true }, orderItem: { product: true, oldProduct: { product: true } } } });
    if (!warranty) throw new NotFoundException(`Warranty #${id} not found`);
    return warranty;
  }
  async findOneForUser(id: number, user: any) {
    const warranty = await this.findOne(id);
    if (!['ADMIN','OWNER','STAFF','TECHNICIAN'].includes(user?.role) && warranty.customerId !== Number(user?.userId)) throw new ForbiddenException();
    return warranty;
  }
  async update(id: number, input: any) {
    const warranty = await this.findOne(id);
    if (warranty.status === 'void') throw new BadRequestException('Cannot update a void warranty');
    Object.assign(warranty, input); return this.repo.save(warranty);
  }
  async voidWarranty(id: number, note?: string) {
    const warranty = await this.findOne(id); warranty.status = 'void'; if (note) warranty.note = note; return this.repo.save(warranty);
  }
  async getStats() {
    const [total, active, expired, claimed, voided] = await Promise.all(['active','expired','claimed','void'].map(status => this.repo.count({ where: { status: status as any } })));
    return { total, active, expired, claimed, void: voided };
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireWarranties() { await this.repo.createQueryBuilder().update(Warranty).set({ status: 'expired' }).where('status = :active', { active: 'active' }).andWhere('end_date < CURDATE()').execute(); }
}
