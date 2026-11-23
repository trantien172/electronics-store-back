import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./Product.entity";

@Index("name", ["name"], { unique: true })
@Entity("brand")
export class Brand {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("varchar", { name: "country", nullable: true, length: 100 })
  country: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToMany(() => Product, (product) => product.brands)
  products: Product[];
}
