import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Repair } from './Repair.entity';

@Entity('repair_status_history')
export class RepairStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'repair_id', type: 'int' }) repairId: number;
  @Column({ name: 'from_status', type: 'varchar', length: 30, nullable: true }) fromStatus: string | null;
  @Column({ name: 'to_status', type: 'varchar', length: 30 }) toStatus: string;
  @Column({ name: 'changed_by', type: 'int', nullable: true }) changedBy: number | null;
  @Column({ type: 'text', nullable: true }) note: string | null;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @ManyToOne(() => Repair, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'repair_id' }) repair: Repair;
}
