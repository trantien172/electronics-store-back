import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../user/entity/User.entity";
import { OrderItem } from "./OrderItem.entity";

@Index("user_id", ["userId"], {})
@Entity("order")
export class Order {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("timestamp", {
    name: "order_date",
    default: () => "CURRENT_TIMESTAMP",
  })
  orderDate: Date;

  @Column("decimal", {
    name: "total_price",
    nullable: true,
    precision: 15,
    scale: 2,
  })
  totalPrice: string | null;

  @Column("enum", {
    name: "status",
    enum: ["pending", "paid", "shipped", "completed", "cancelled"],
  })
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

}
