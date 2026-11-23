import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RepairItem } from './RepairItem.entity';
import { RepairItemQuoteLine } from './RepairItemQuoteLine.entity';

@Entity('repair_item_quote')
export class RepairItemQuote {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'repair_item_id', type: 'int' }) repairItemId: number;
  @Column({ name: 'created_by', type: 'int' }) createdBy: number;
  @Column({ type: 'decimal', precision: 12, scale: 0 }) amount: string;
  @Column({ type: 'text', nullable: true }) reason: string | null;
  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected'], default: 'pending' }) status: string;
  @Column({ name: 'responded_at', type: 'datetime', nullable: true }) respondedAt: Date | null;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @ManyToOne(() => RepairItem, item => item.quotes, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'repair_item_id' }) repairItem: RepairItem;
  @OneToMany(() => RepairItemQuoteLine, line => line.quote) lines: RepairItemQuoteLine[];
}
