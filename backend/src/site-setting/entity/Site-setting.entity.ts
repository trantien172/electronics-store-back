import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Index("setting_key", ["settingKey"], { unique: true })
@Entity("site_setting")
export class SiteSetting {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "setting_key", unique: true, length: 100 })
  settingKey: string;

  @Column("text", { name: "setting_value", nullable: true })
  settingValue: string | null;

  @Column("varchar", { name: "description", nullable: true, length: 255 })
  description: string | null;

  @Column("int", { name: "updated_by", nullable: true })
  updatedBy: number | null;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}