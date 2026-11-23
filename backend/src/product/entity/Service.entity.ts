import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./Product.entity";
import { Category } from "./Category.entity";

@Index("name", ["name"], { unique: true })
@Entity("service")
export class Service {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("int", { name: "category_id", nullable: true})
  categoryId: number | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToMany(() => Product, (product) => product.services)
  @JoinTable({name: "service_product",
    joinColumn: {
      name: "service_id", // Tên cột liên kết tới bảng Service hiện tại
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "product_id", // Tên cột liên kết tới bảng đối diện (Product)
      referencedColumnName: "id",
    },})
  products: Product[];

  @ManyToOne(()=>Category, (category)=>category.services)
  @JoinColumn({name: 'category_id'})
  category: Category
}
