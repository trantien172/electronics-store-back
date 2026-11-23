import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entity/User.entity';
import { RepairItem } from '../../repair/entity/RepairItem.entity';
import { RepairItemProduct } from '../../repair/entity/RepairItemProduct.entity';
import { OrderItem } from '../../order/entity/OrderItem.entity';

@Index('idx_warranty_customer', ['customerId'])
@Entity('warranty')
export class Warranty {
  @PrimaryGeneratedColumn({ type: 'int' }) id: number;
  @Column({ name: 'repair_item_id', type: 'int', nullable: true, unique: true }) repairItemId: number | null;
  @Column({ name: 'repair_item_product_id', type: 'bigint', nullable: true, unique: true }) repairItemProductId: string | null;
  @Column({ name: 'order_item_id', type: 'bigint', nullable: true, unique: true }) orderItemId: string | null;
  @Column({ name: 'serial_number', type: 'varchar', length: 150, nullable: true }) serialNumber: string | null;
  @Column({ name: 'customer_id', type: 'int' }) customerId: number;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'start_date', type: 'date' }) startDate: string;
  @Column({ name: 'end_date', type: 'date' }) endDate: string;
  @Column({ type: 'enum', enum: ['active', 'expired', 'claimed', 'void'], default: 'active' }) status: 'active' | 'expired' | 'claimed' | 'void';
  @Column({ type: 'text', nullable: true }) note: string | null;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @Column({ name: 'deleted_at', type: 'datetime', nullable: true }) deletedAt: Date | null;
  @ManyToOne(() => User, user => user.warranties, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'customer_id' }) customer: User;
  @OneToOne(() => RepairItem, { nullable: true }) @JoinColumn({ name: 'repair_item_id' }) repairItem: RepairItem | null;
  @OneToOne(() => RepairItemProduct, { nullable: true }) @JoinColumn({ name: 'repair_item_product_id' }) repairItemProduct: RepairItemProduct | null;
  @OneToOne(() => OrderItem, orderItem => orderItem.warranty, { nullable: true }) @JoinColumn({ name: 'order_item_id' }) orderItem: OrderItem | null;
}
