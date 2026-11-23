import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RepairItemQuote } from './RepairItemQuote.entity';

@Entity('quote_response_history')
export class QuoteResponseHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'quote_id', type: 'bigint' }) quoteId: string;
  @Column({ name: 'customer_id', type: 'int' }) customerId: number;
  @Column({ type: 'enum', enum: ['accepted', 'rejected'] }) action: string;
  @Column({ type: 'text', nullable: true }) note: string | null;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @ManyToOne(() => RepairItemQuote, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'quote_id' }) quote: RepairItemQuote;
}
