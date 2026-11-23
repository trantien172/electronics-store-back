import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
} from "typeorm";
import { Order } from "./Order.entity";
import { Product } from "../../product/entity/Product.entity";
import { OldProduct } from "../../product/entity/OldProduct.entity";
import { Warranty } from "../../warranty/entity/Warranty.entity";


@Index("order_id", ["orderId"], {})
@Index("product_id", ["productId"], {})
@Index("old_product_id", ["oldProductId"], {})
@Entity("order_item")
export class OrderItem {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "order_id" })
  orderId: number;

  @Column("int", { name: "product_id", nullable: true })
  productId: number | null;

  @Column("int", { name: "old_product_id", nullable: true })
  oldProductId: number | null;

  @Column("int", { name: "quantity", nullable: true, default: "1" })
  quantity: number | null;

  @Column("decimal", { name: "price", precision: 15, scale: 2 })
  price: string;



  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: "SET NULL",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => OldProduct, (oldProduct) => oldProduct.orderItems, {
    onDelete: "SET NULL",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([
    { name: "old_product_id", referencedColumnName: "id" },
  ])
  oldProduct: OldProduct;

  @OneToOne(() => Warranty, (warranty) => warranty.orderItem)
  warranty: Warranty;
}

