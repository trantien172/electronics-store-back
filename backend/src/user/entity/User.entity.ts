import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CustomerProfile } from "./CustomerProfile.entity";
import { Order } from "../../order/entity/Order.entity";
import { Repair } from "../../repair/entity/Repair.entity";
import { RepairItem } from "../../repair/entity/RepairItem.entity";
import { StaffProfile } from "./StaffProfile.entity";
import { Warranty } from "../../warranty/entity/Warranty.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn( {name: "id"})
  id: number;

  @Column("varchar", { name: "email", nullable: true, length: 100 })
  email: string | null;

  @Column("varchar", { name: "phone", length: 20 })
  phone: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string | null;

  @Column("enum", {
    name: "role",
    nullable: true,
    enum: ["CLIENT", "STAFF", "ADMIN", "OWNER", "TECHNICIAN", "customer", "technician", "shop_owner", "admin", "worker", "client"],
    default: "CLIENT",
  })
  role: "CLIENT" | "STAFF" | "ADMIN" | "OWNER" | "TECHNICIAN" | "customer" | "technician" | "shop_owner" | "admin" | "worker" | "client" | null;

  @Column("enum", { name: "status", enum: ["ACTIVE", "LOCKED", "INACTIVE", "UNCLAIMED"], default: "ACTIVE" })
  status: "ACTIVE" | "LOCKED" | "INACTIVE" | "UNCLAIMED";

  @Column("datetime", { name: "phone_verified_at", nullable: true })
  phoneVerifiedAt: Date | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column("varchar", { name: "name", length: 100 })
  name: string;

  @OneToOne(() => CustomerProfile, (customerProfile) => customerProfile.user)
  customerProfile: CustomerProfile;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Repair, (repair) => repair.customer)
  repairs: Repair[];

  @OneToMany(() => RepairItem, (repairItem) => repairItem.technician)
  repairItems: RepairItem[];

  @OneToOne(() => StaffProfile, (staffProfile) => staffProfile.user)
  staffProfile: StaffProfile;

  @OneToMany(() => Warranty, (warranty) => warranty.customer)
  warranties: Warranty[];
}
