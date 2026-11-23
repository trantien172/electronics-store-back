import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Index("idx_entity", ["entityType", "entityId"], {})
@Entity("media_files")
export class MediaFile {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("enum", {
    name: "entity_type",
    enum: [
      "product",
      "old_product",
      "repair_item",
      "user",
      "site",
      "category",
      "brand",
    ],
  })
  entityType:
    | "product"
    | "old_product"
    | "repair_item"
    | "user"
    | "site"
    | "category"
    | "brand";

  @Column("bigint", { name: "entity_id" })
  entityId: string;

  @Column("text", { name: "file_url" })
  fileUrl: string;

  // Cloudinary public_id — dùng để xóa file trên cloud
  @Column("varchar", { name: "public_id", length: 255 })
  publicId: string;

  @Column("enum", {
    name: "file_type",
    nullable: true,
    enum: ["image", "audio", "video", "document"],
    default: "image",
  })
  fileType: "image" | "audio" | "video" | "document" | null;

  @Column("varchar", { name: "description", nullable: true, length: 255 })
  description: string | null;

  @Column("tinyint", {
    name: "is_primary",
    nullable: true,
    width: 1,
    default: "0",
  })
  isPrimary: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}