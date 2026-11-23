import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinTable
} from "typeorm";
import { OldProduct } from "./OldProduct.entity";
import { OrderItem } from "../../order/entity/OrderItem.entity";
import { Category } from "./Category.entity";
import { Brand } from "./Brand.entity";
import { Service } from "./Service.entity"
import { RepairItemProduct } from "src/repair/entity/RepairItemProduct.entity";

@Index("fk_products_category", ["categoryId"], {})
@Entity("product")
export class Product {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "category_id" })
  categoryId: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "model", nullable: true, length: 100 })
  model: string | null;

  @Column("int", { name: "manufacture_year", nullable: true })
  manufactureYear: number | null;

  @Column("decimal", {
    name: "base_price",
    nullable: true,
    precision: 15,
    scale: 0,
    default: 0,
  })
  basePrice: number | null;

  @Column("decimal", {
    name: "selling_price",
    nullable: true,
    precision: 15,
    scale: 0,
    default: 0,
  })
  sellingPrice: number | null;

  @Column("int", { name: "quantity", nullable: true, default: 0 })
  quantity: number | null;

  @Column("int", { name: "warranty_months", nullable: true })
  warrantyMonths: number | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("tinyint", {
    name: "is_active",
    nullable: true,
    width: 1,
    default: 1,
  })
  isActive: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => OldProduct, (oldProduct) => oldProduct.product)
  oldProducts: OldProduct[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: Category;

  @ManyToMany(() => Brand, (brand) => brand.products)
  @JoinTable({ name: 'product_brand', joinColumn: { name: 'product_id', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'brand_id', referencedColumnName: 'id' } })
  brands: Brand[];

  @OneToMany(() => RepairItemProduct, (repairItemProduct) => repairItemProduct.product)
  repairItemProducts: RepairItemProduct[];

  @ManyToMany(() => Service, (service) => service.products)
  services: Service[];

}
