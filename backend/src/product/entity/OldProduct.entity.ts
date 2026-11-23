import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./Product.entity";
import { OrderItem } from "../../order/entity/OrderItem.entity";

@Index("serial_number", ["serialNumber"], { unique: true })
@Index("fk_oldprod_product", ["id"], {})
@Entity("old_product")
export class OldProduct {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("varchar", {
    name: "serial_number",
    nullable: true,
    unique: true,
    length: 150,
  })
  serialNumber: string | null;

  @Column("enum", {
    name: "condition_status",
    nullable: true,
    enum: ["like_new", "used", "broken"],
    default: "used",
  })
  conditionStatus: "like_new" | "used" | "broken" | null;

  @Column("int", {
    name: "warranty_months",
    nullable: true,
    default: "0",
  })
  warrantyMonths: number | null;

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

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["available", "reserved", "sold", "in_repair"],
    default: "available",
  })
  status: "available" | "reserved" | "sold" | "in_repair" | null;

  @Column("text", { name: "note", nullable: true })
  note: string | null;

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

  @ManyToOne(() => Product, (product) => product.oldProducts, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.oldProduct)
  orderItems: OrderItem[];

}
