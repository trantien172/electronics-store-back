import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/Order.entity';
import { OrderItem } from './entity/OrderItem.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

// Status chỉ được đi theo 1 chiều
const STATUS_ORDER = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  // ─── Orders CRUD ──────────────────────────────────────────────────────────────

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create({ ...dto, status: 'pending' });
    return this.orderRepo.save(order);
  }

  async findAll(status?: string, userId?: number) {
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    return this.orderRepo.find({
      where,
      relations: ['orderItems', 'orderItems.product', 'orderItems.oldProduct'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'orderItems.oldProduct', 'warranties'],
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product', 'orderItems.oldProduct'],
      order: { orderDate: 'DESC' },
    });
  }

  async updateStatus(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    if(!order)
        throw new BadRequestException(
        `This order is not exist`,
      );
    if (order.status === 'cancelled') {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    // Không cho phép quay lại trạng thái trước (ngoại trừ cancel)
    const currentIndex = STATUS_ORDER.indexOf(order.status as string);
    const newIndex = STATUS_ORDER.indexOf(dto.status as string);

    if (dto.status !== 'cancelled' && newIndex < currentIndex) {
      throw new BadRequestException(
        `Cannot change status from '${order.status}' back to '${dto.status}'`,
      );
    }

    order.status = dto.status ;
    return this.orderRepo.save(order);
  }

  // ─── Tính lại total_price ─────────────────────────────────────────────────────

  private async recalculateTotal(orderId: number): Promise<void> {
    const items = await this.orderItemRepo.find({ where: { orderId } });
    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * (item.quantity ?? 1),
      0,
    );
    await this.orderRepo.update(orderId, { totalPrice: total.toFixed(2) });
  }

  // ─── Order Items ──────────────────────────────────────────────────────────────

  async getItems(orderId: number): Promise<OrderItem[]> {
    await this.findOne(orderId); // ensure order exists
    return this.orderItemRepo.find({
      where: { orderId },
      relations: ['product', 'oldProduct'],
    });
  }

  async addItem(orderId: number, dto: CreateOrderItemDto): Promise<OrderItem> {
    const order = await this.orderRepo.findOne({where:{id: orderId}});
    if(!order)
        throw new BadRequestException(
        `This order is not exist`,
      );
    if (!dto.productId && !dto.oldProductId) {
      throw new BadRequestException('Order item must have productId or oldProductId');
    }

    if (['completed', 'cancelled'].includes(order.status)) {
      throw new BadRequestException(
        `Cannot add items to a ${order.status} order`,
      );
    }

    const item = this.orderItemRepo.create({ orderId, ...dto });
    const saved = await this.orderItemRepo.save(item);

    await this.recalculateTotal(orderId);
    return saved;
  }

  async updateItem(
    orderId: number,
    itemId: number,
    dto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId, orderId },
    });
    if (!item) throw new NotFoundException(`OrderItem #${itemId} not found`);

    Object.assign(item, dto);
    const saved = await this.orderItemRepo.save(item);

    await this.recalculateTotal(orderId);
    return saved;
  }

  async removeItem(orderId: number, itemId: number): Promise<void> {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId, orderId },
    });
    if (!item) throw new NotFoundException(`OrderItem #${itemId} not found`);

    await this.orderItemRepo.remove(item);
    await this.recalculateTotal(orderId);
  }

  // ─── Stats ────────────────────────────────────────────────────────────────────

  async getStats() {
    const [total, pending, paid, shipped, completed, cancelled] = await Promise.all([
      this.orderRepo.count(),
      this.orderRepo.count({ where: { status: 'pending' } }),
      this.orderRepo.count({ where: { status: 'paid' } }),
      this.orderRepo.count({ where: { status: 'shipped' } }),
      this.orderRepo.count({ where: { status: 'completed' } }),
      this.orderRepo.count({ where: { status: 'cancelled' } }),
    ]);

    return { total, pending, paid, shipped, completed, cancelled };
  }
}