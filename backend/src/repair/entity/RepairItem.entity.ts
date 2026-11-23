import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Repair } from './Repair.entity';
import { User } from '../../user/entity/User.entity';
import { Category } from '../../product/entity/Category.entity';
import { RepairItemProduct } from './RepairItemProduct.entity';
import { RepairItemQuote } from './RepairItemQuote.entity';

@Index('idx_repair_item_repair', ['repairId'])
@Entity('repair_item')
export class RepairItem {
  @PrimaryGeneratedColumn({ type: 'int' }) id: number;
  @Column({ name: 'repair_id', type: 'int' }) repairId: number;
  @Column({ name: 'technician_id', type: 'int', nullable: true }) technicianId: number | null;
  @Column({ name: 'warranty_claim_id', type: 'int', nullable: true }) warrantyClaimId: number | null;
  @Column({ name: 'category_id', type: 'int' }) categoryId: number;
  @Column({ name: 'service_mode', type: 'enum', enum: ['AT_SHOP', 'AT_HOME'], default: 'AT_SHOP' }) serviceMode: string;
  @Column({ name: 'device_model', type: 'varchar', length: 100, nullable: true }) deviceModel: string | null;
  @Column({ name: 'device_serial', type: 'varchar', length: 150, nullable: true }) deviceSerial: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) accessories: string | null;
  @Column({ name: 'received_condition', type: 'text', nullable: true }) receivedCondition: string | null;
  @Column({ name: 'problem_description', type: 'text', nullable: true }) problemDescription: string | null;
  @Column({ type: 'text', nullable: true }) note: string | null;
  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 }) fee: string;
  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 0, default: 0 }) totalAmount: string;
  @Column({ name: 'payment_method', type: 'enum', enum: ['CASH', 'BANK_TRANSFER'], nullable: true }) paymentMethod: string | null;
  @Column({ name: 'payment_status', type: 'enum', enum: ['PAID', 'UNPAID'], default: 'UNPAID' }) paymentStatus: string;
  @Column({ name: 'paid_at', type: 'datetime', nullable: true }) paidAt: Date | null;
  @Column({ type: 'enum', enum: ['pending','assigned','in_progress','waiting_parts','waiting_quote','completed','cancelled'], default: 'pending' }) status: string;
  @Column({ name: 'received_at', type: 'datetime', nullable: true }) receivedAt: Date | null;
  @Column({ name: 'completed_at', type: 'datetime', nullable: true }) completedAt: Date | null;
  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true }) cancelledAt: Date | null;
  @Column({ name: 'handed_over_at', type: 'datetime', nullable: true }) handedOverAt: Date | null;
  @ManyToOne(() => Category, category => category.repairItems, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'category_id' }) category: Category;
  @ManyToOne(() => Repair, repair => repair.repairItems, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'repair_id' }) repair: Repair;
  @ManyToOne(() => User, user => user.repairItems, { nullable: true, onDelete: 'RESTRICT' }) @JoinColumn({ name: 'technician_id' }) technician: User | null;
  @OneToMany(() => RepairItemProduct, itemProduct => itemProduct.repairItem) repairItemProducts: RepairItemProduct[];
  @OneToMany(() => RepairItemQuote, quote => quote.repairItem) quotes: RepairItemQuote[];
}
