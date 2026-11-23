import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { User } from '../user/entity/User.entity';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { Category } from '../product/entity/Category.entity';
import { Service } from '../product/entity/Service.entity';
import { Repair } from './entity/Repair.entity';
import { RepairItem } from './entity/RepairItem.entity';
import { RepairItemQuote } from './entity/RepairItemQuote.entity';
import { RepairItemQuoteLine } from './entity/RepairItemQuoteLine.entity';
import { RepairStatusHistory } from './entity/RepairStatusHistory.entity';
import { CreateRepairDto } from './dto/create-repair.dto';

const staffRoles = ['STAFF', 'ADMIN', 'OWNER', 'TECHNICIAN', 'shop_owner', 'admin', 'technician'];
@Injectable()
export class RepairService {
  constructor(
    @InjectRepository(Repair) private readonly repairRepo: Repository<Repair>,
    @InjectRepository(RepairItem) private readonly itemRepo: Repository<RepairItem>,
    @InjectRepository(RepairItemQuote) private readonly quoteRepo: Repository<RepairItemQuote>,
    private readonly dataSource: DataSource,
    private readonly users: UserService,
    private readonly auth: AuthService,
  ) {}

  async create(dto: CreateRepairDto, authenticatedUser?: any) {
    if (dto.repairItems.length !== 1) {
      throw new BadRequestException('Online repair requests can contain exactly one device');
    }
    let customer: User;
    const signedInAccount = authenticatedUser?.userId
      ? await this.users.findOne(Number(authenticatedUser.userId))
      : null;
    if (authenticatedUser?.userId && !signedInAccount) {
      throw new NotFoundException('Customer account not found');
    }
    if (signedInAccount?.phone?.trim() === dto.contact.trim()) {
      customer = signedInAccount;
    } else {
      if (!dto.otp) throw new BadRequestException('OTP verification is required for this phone number');
      await this.auth.verifyOtp(dto.contact, dto.otp, 'repair');
      const guest = await this.users.findOrCreateVerifiedGuest(dto.contact, dto.name || 'FixPro customer');
      if (!guest) throw new NotFoundException('Could not create guest customer');
      customer = guest;
    }
    return this.persistRepair(dto, customer, customer.id);
  }

  async createAtCounter(dto: CreateRepairDto, employee: any) {
    if (!staffRoles.includes(employee?.role)) throw new ForbiddenException('Staff access is required');
    if (dto.repairItems.some((item) => item.serviceMode !== 'AT_SHOP')) {
      throw new BadRequestException('Counter intake is only available for devices brought to the store');
    }
    const customer = await this.users.findOrCreateVerifiedGuest(dto.contact, dto.name || 'FixPro customer');
    if (!customer) throw new NotFoundException('Could not create customer record');
    return this.persistRepair(dto, customer, Number(employee.userId));
  }

  private async persistRepair(dto: CreateRepairDto, customer: User, actorId: number) {
    const runner = this.dataSource.createQueryRunner(); await runner.connect(); await runner.startTransaction();
    try {
      const code = `FP-${randomBytes(6).toString('hex').toUpperCase()}`;
      const repair = await runner.manager.save(Repair, runner.manager.create(Repair, {
        code, customerId: customer.id, contact: dto.contact, visitAddress: dto.visitAddress || null,
        note: dto.note || null, status: 'pending', totalAmount: '0',
      }));
      const items: RepairItem[] = [];
      const requestedServiceNames: string[] = [];
      for (const input of dto.repairItems) {
        const category = await runner.manager.findOne(Category, { where: { id: input.categoryId } });
        if (!category) throw new BadRequestException(`Device category ${input.categoryId} was not found`);
        const requestedService = input.serviceId
          ? await runner.manager.findOne(Service, { where: { id: input.serviceId, categoryId: input.categoryId } })
          : null;
        if (input.serviceId && !requestedService) {
          throw new BadRequestException('Selected service does not belong to the selected device category');
        }
        if (requestedService) requestedServiceNames.push(requestedService.name);
        items.push(await runner.manager.save(RepairItem, runner.manager.create(RepairItem, {
          repairId: repair.id, categoryId: input.categoryId, deviceModel: input.deviceModel || null,
          deviceSerial: input.deviceSerial || null, accessories: input.accessories || null,
          receivedCondition: input.receivedCondition || null, problemDescription: input.problemDescription,
          serviceMode: input.serviceMode || 'AT_SHOP', fee: '0', totalAmount: '0', status: 'pending', paymentStatus: 'UNPAID',
        })));
      }
      if (requestedServiceNames.length) {
        repair.note = [dto.note?.trim(), ...requestedServiceNames.map((name) => `Dịch vụ khách quan tâm: ${name}`)]
          .filter(Boolean).join('\n');
        await runner.manager.save(Repair, repair);
      }
      await runner.manager.save(RepairStatusHistory, runner.manager.create(RepairStatusHistory, {
        repairId: repair.id, fromStatus: null, toStatus: 'pending', changedBy: actorId, note: 'Repair request submitted',
      }));
      for (const item of items) await runner.query(
        "INSERT INTO repair_item_log(repair_item_id,event_type,changed_by,from_status,to_status,note,is_public) VALUES(?, 'status_changed', ?, NULL, 'pending', 'Repair request submitted', 1)",
        [item.id, actorId],
      );
      await runner.commitTransaction();
      return this.getById(repair.id);
    } catch (error) { await runner.rollbackTransaction(); throw error; }
    finally { await runner.release(); }
  }

  async listMine(userId: number) { return this.repairRepo.find({ where: { customerId: userId }, relations: { repairItems: { category: true } }, order: { createdAt: 'DESC' } }); }
  async listAll(status?: string, page = 1, limit = 20) {
    const [items, total] = await this.repairRepo.findAndCount({ where: status ? { status } : {}, relations: { repairItems: { category: true } }, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit });
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
  async getById(id: number) {
    const repair = await this.repairRepo.findOne({ where: { id }, relations: { repairItems: { category: true, quotes: { lines: true }, technician: true } } });
    if (!repair) throw new NotFoundException('Repair not found');
    const [repairHistory, itemHistory] = await Promise.all([
      this.dataSource.query('SELECT id,from_status AS fromStatus,to_status AS toStatus,note,created_at AS createdAt FROM repair_status_history WHERE repair_id=? ORDER BY created_at,id', [id]),
      this.dataSource.query('SELECT l.id,l.repair_item_id AS repairItemId,l.event_type AS eventType,l.from_status AS fromStatus,l.to_status AS toStatus,l.note,l.is_public AS isPublic,l.created_at AS createdAt FROM repair_item_log l INNER JOIN repair_item i ON i.id=l.repair_item_id WHERE i.repair_id=? ORDER BY l.created_at,l.id', [id]),
    ]);
    return { ...repair, history: repairHistory, itemHistory };
  }
  async getForCustomer(id: number, user: any) {
    const repair = await this.getById(id);
    if (!staffRoles.includes(user?.role) && repair.customerId !== Number(user?.userId)) throw new ForbiddenException();
    if (!staffRoles.includes(user?.role)) repair.itemHistory = repair.itemHistory.filter((entry: any) => entry.isPublic);
    return repair;
  }
  async getByCodeForCustomer(code: string, user: any) {
    const repair = await this.repairRepo.findOneBy({ code });
    if (!repair) throw new NotFoundException('Repair not found');
    return this.getForCustomer(repair.id, user);
  }
  async track(code: string, phone: string) {
    const repair = await this.repairRepo.findOne({ where: { code, contact: phone } });
    if (!repair) throw new NotFoundException('Repair code and phone number did not match');
    const details = await this.getById(repair.id);
    details.itemHistory = details.itemHistory.filter((entry: any) => entry.isPublic);
    return details;
  }
  async quickLookup(phone: string, otp?: string, authenticatedUser?: any) {
    const account = authenticatedUser?.userId
      ? await this.users.findOne(Number(authenticatedUser.userId))
      : null;
    const phoneMatchesAccount = account?.phone?.trim() === phone.trim();
    if (!phoneMatchesAccount) {
      if (!otp) throw new BadRequestException('OTP verification is required');
      await this.auth.verifyOtp(phone, otp, 'repair');
    }

    const repairs = await this.repairRepo.find({
      where: { contact: phone, deletedAt: IsNull() },
      relations: { repairItems: { category: true } },
      order: { createdAt: 'DESC' },
      take: 3,
    });
    return repairs.map((repair) => ({
      id: repair.id,
      code: repair.code,
      status: repair.status,
      receivedAt: repair.createdAt,
      repairItems: repair.repairItems.map((item) => ({
        id: item.id,
        status: item.status,
        deviceModel: item.deviceModel,
        problemDescription: item.problemDescription,
        totalAmount: item.totalAmount,
        category: item.category ? { name: item.category.name } : null,
      })),
    }));
  }
  async updateStatus(id: number, status: string, actorId: number, note?: string) {
    const allowed = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) throw new BadRequestException('Unsupported repair status');
    const repair = await this.repairRepo.findOneBy({ id }); if (!repair) throw new NotFoundException();
    if (repair.status === status) return repair;
    await this.dataSource.transaction(async manager => {
      await manager.save(RepairStatusHistory, { repairId: id, fromStatus: repair.status, toStatus: status, changedBy: actorId, note: note || null });
      repair.status = status; await manager.save(repair);
    });
    return this.getById(id);
  }
  async updateItemStatus(id: number, status: string, actorId: number, note?: string) {
    const allowed = ['pending','assigned','in_progress','waiting_parts','waiting_quote','completed','cancelled'];
    if (!allowed.includes(status)) throw new BadRequestException('Unsupported repair item status');
    const item = await this.itemRepo.findOneBy({ id }); if (!item) throw new NotFoundException('Repair item not found');
    await this.dataSource.transaction(async manager => {
      await manager.query("INSERT INTO repair_item_log(repair_item_id,event_type,changed_by,from_status,to_status,note,is_public) VALUES(?, 'status_changed', ?, ?, ?, ?, 1)", [id, actorId, item.status, status, note || null]);
      item.status = status;
      if (status === 'completed') item.completedAt = new Date();
      if (status === 'cancelled') item.cancelledAt = new Date();
      await manager.save(item);
    });
    return this.itemRepo.findOne({ where: { id }, relations: { category: true, technician: true } });
  }
  async addQuote(itemId: number, actorId: number, input: { reason?: string; lines: { description: string; quantity: number; unitPrice: number }[] }) {
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: { repair: true } });
    if (!item) throw new NotFoundException('Repair item not found');
    if (!input.lines?.length) throw new BadRequestException('A quote must contain at least one line');
    const amount = input.lines.reduce((total, line) => total + Number(line.quantity) * Number(line.unitPrice), 0);
    if (amount <= 0 || input.lines.some(line => Number(line.quantity) <= 0 || Number(line.unitPrice) < 0)) throw new BadRequestException('Invalid quote totals');
    const runner = this.dataSource.createQueryRunner(); await runner.connect(); await runner.startTransaction();
    try {
      const quote = await runner.manager.save(RepairItemQuote, runner.manager.create(RepairItemQuote, { repairItemId: itemId, createdBy: actorId, amount: String(amount), reason: input.reason || null, status: 'pending' }));
      for (let i = 0; i < input.lines.length; i++) {
        const line = input.lines[i]; await runner.manager.save(RepairItemQuoteLine, { quoteId: quote.id, description: line.description, quantity: String(line.quantity), unitPrice: String(line.unitPrice), sortOrder: i });
      }
      await runner.query("INSERT INTO repair_item_log(repair_item_id,event_type,changed_by,note,is_public) VALUES(?, 'quote_created', ?, 'A quotation is available', 1)", [itemId, actorId]);
      await runner.commitTransaction();
      return this.quoteRepo.findOne({ where: { id: quote.id }, relations: { lines: true } });
    } catch (error) { await runner.rollbackTransaction(); throw error; } finally { await runner.release(); }
  }
  async respondToQuote(quoteId: string, customerId: number, action: 'accepted' | 'rejected', note?: string) {
    const quote = await this.quoteRepo.findOne({ where: { id: quoteId }, relations: { repairItem: { repair: true } } });
    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.repairItem.repair.customerId !== customerId) throw new ForbiddenException();
    if (quote.status !== 'pending') throw new BadRequestException('This quotation has already been answered');
    await this.dataSource.transaction(async manager => {
      if (action === 'accepted') {
        const accepted = await manager.count(RepairItemQuote, { where: { repairItemId: quote.repairItemId, status: 'accepted' } });
        if (accepted) throw new BadRequestException('Another quotation revision has already been accepted');
      }
      quote.status = action; quote.respondedAt = new Date(); await manager.save(quote);
      await manager.query('INSERT INTO quote_response_history(quote_id,customer_id,action,note) VALUES(?,?,?,?)', [quote.id, customerId, action, note || null]);
      await manager.query("INSERT INTO repair_item_log(repair_item_id,event_type,changed_by,note,is_public) VALUES(?, ?, ?, ?, 1)", [quote.repairItemId, action === 'accepted' ? 'quote_approved' : 'quote_rejected', customerId, note || null]);
    });
    return this.quoteRepo.findOne({ where: { id: quoteId }, relations: { lines: true } });
  }
}
