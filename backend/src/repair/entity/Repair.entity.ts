import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entity/User.entity';
import { RepairItem } from './RepairItem.entity';

@Index('uq_repair_code', ['code'], { unique: true })
@Index('idx_repair_customer', ['customerId'])
@Entity('repair')
export class Repair {
  @PrimaryGeneratedColumn({ type: 'int' }) id: number;
  @Column({ type: 'varchar', length: 30 }) code: string;
  @Column({ name: 'customer_id', type: 'int' }) customerId: number;
  @Column({ type: 'varchar', length: 20 }) contact: string;
  @Column({ name: 'visit_address', type: 'varchar', length: 255, nullable: true }) visitAddress: string | null;
  @Column({ name: 'internal_notes', type: 'text', nullable: true }) internalNotes: string | null;
  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 0, default: 0 }) totalAmount: string;
  @Column({ name: 'promised_date', type: 'datetime', nullable: true }) promisedDate: Date | null;
  @Column({ type: 'text', nullable: true }) note: string | null;
  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' }) status: string;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }) updatedAt: Date;
  @Column({ name: 'deleted_at', type: 'datetime', nullable: true }) deletedAt: Date | null;
  @ManyToOne(() => User, user => user.repairs, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'customer_id' }) customer: User;
  @OneToMany(() => RepairItem, item => item.repair) repairItems: RepairItem[];
}
