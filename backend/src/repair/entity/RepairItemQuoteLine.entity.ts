import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RepairItemQuote } from './RepairItemQuote.entity';

@Entity('repair_item_quote_line')
export class RepairItemQuoteLine {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'quote_id', type: 'bigint' }) quoteId: string;
  @Column({ type: 'varchar', length: 255 }) description: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 }) quantity: string;
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 0 }) unitPrice: string;
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder: number;
  @ManyToOne(() => RepairItemQuote, quote => quote.lines, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'quote_id' }) quote: RepairItemQuote;
}
