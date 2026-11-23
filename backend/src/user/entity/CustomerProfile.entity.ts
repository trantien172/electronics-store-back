import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.entity";

@Index("user_id", ["userId"], { unique: true })
@Entity("customer_profile")
export class CustomerProfile {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id", nullable: true, unique: true })
  userId: number | null;

  @Column("varchar", { name: "address", nullable: true, length: 255 })
  address: string | null;

  @Column("date", { name: "birthday", nullable: true })
  birthday: string | null;

  @Column("int", {
    name: "loyalty_points",
    nullable: true,
    default: 0,
  })
  loyaltyPoints: number | null;

  @OneToOne(() => User, (user) => user.customerProfile, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
