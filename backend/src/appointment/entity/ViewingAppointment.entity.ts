import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entity/User.entity';

@Index('idx_va_customer', ['customerId'])
@Entity('viewing_appointment')
export class ViewingAppointment {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'old_product_id', type: 'int' }) oldProductId: number;
  @Column({ name: 'customer_id', type: 'int' }) customerId: number;
  @Column({ name: 'customer_name', type: 'varchar', length: 100 }) customerName: string;
  @Column({ name: 'customer_phone', type: 'varchar', length: 20 }) customerPhone: string;
  @Column({ name: 'scheduled_at', type: 'datetime' }) scheduledAt: Date;
  @Column({ name: 'expires_at', type: 'datetime' }) expiresAt: Date;
  @Column({ type: 'enum', enum: ['PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW'], default: 'PENDING' }) status: string;
  @Column({ type: 'text', nullable: true }) note: string | null;
  @Column({ name: 'confirmed_by', type: 'int', nullable: true }) confirmedBy: number | null;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }) updatedAt: Date;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'customer_id' }) customer: User;
}
