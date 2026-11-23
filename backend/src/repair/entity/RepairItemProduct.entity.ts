import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RepairItem } from './RepairItem.entity';
import { Product } from '../../product/entity/Product.entity';

@Entity('repair_item_product')
export class RepairItemProduct {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'repair_item_id', type: 'int' }) repairItemId: number;
  @Column({ name: 'product_id', type: 'int' }) productId: number;
  @Column({ type: 'int', default: 1 }) quantity: number;
  @Column({ name: 'unit_cost', type: 'decimal', precision: 12, scale: 0, default: 0 }) unitCost: string;
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 0, default: 0 }) unitPrice: string;
  @ManyToOne(() => RepairItem, item => item.repairItemProducts, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'repair_item_id' }) repairItem: RepairItem;
  @ManyToOne(() => Product, product => product.repairItemProducts, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'product_id' }) product: Product;
}
