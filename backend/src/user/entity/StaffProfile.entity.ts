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
@Entity("staff_profile")
export class StaffProfile {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id", nullable: true, unique: true })
  userId: number | null;

  @Column("varchar", { name: "position", nullable: true, length: 100 })
  position: string | null;

  @Column("varchar", { name: "specialization", nullable: true, length: 150 })
  specialization: string | null;

  @Column("date", { name: "hire_date", nullable: true })
  hireDate: string | null;

  @Column("decimal", {
    name: "salary",
    nullable: true,
    precision: 12,
    scale: 0,
  })
  salary: string | null;

  @Column("varchar", { name: "address", nullable: true, length: 255 })
  address: string | null;

  @OneToOne(() => User, (user) => user.staffProfile, {
    onDelete: "CASCADE",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
