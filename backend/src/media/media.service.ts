import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { MediaFile } from './entity/Media.entity';
import { UploadMediaDto, UpdateMediaDto, QueryMediaDto } from './dto/media.dto';

// Map entity_type -> folder trên Cloudinary
const FOLDER_MAP: Record<string, string> = {
  product: 'products',
  old_product: 'old-products',
  repair_item: 'repairs',
  user: 'avatars',
  site: 'site',
  category: 'categories',
  brand: 'brands',
};

// Giới hạn dung lượng theo loại file (bytes)
const SIZE_LIMIT: Record<string, number> = {
  image: 5 * 1024 * 1024,    // 5MB
  audio: 20 * 1024 * 1024,   // 20MB
  video: 50 * 1024 * 1024,   // 50MB
  document: 10 * 1024 * 1024, // 10MB
};

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepo: Repository<MediaFile>,
  ) {}

  // ─── Upload lên Cloudinary ────────────────────────────────────────────────────

  private uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'video' | 'raw' | 'auto',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result: any) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  // file_type -> Cloudinary resource_type
  private toResourceType(
    fileType: string,
  ): 'image' | 'video' | 'raw' | 'auto' {
    if (fileType === 'image') return 'image';
    if (fileType === 'video') return 'video';
    if (fileType === 'audio') return 'video'; // Cloudinary xử lý audio qua resource_type video
    return 'raw'; // document
  }

  // ─── Upload ───────────────────────────────────────────────────────────────────

  async upload(
    file: Express.Multer.File,
    dto: UploadMediaDto,
  ): Promise<MediaFile> {
    if (!file) throw new BadRequestException('No file provided');

    const fileType = dto.fileType ?? 'image';
    const sizeLimit = SIZE_LIMIT[fileType];

    if (file.size > sizeLimit) {
      throw new BadRequestException(
        `File too large. Max size for ${fileType} is ${sizeLimit / 1024 / 1024}MB`,
      );
    }

    const folder = FOLDER_MAP[dto.entityType];
    const resourceType = this.toResourceType(fileType);

    const result = await this.uploadToCloudinary(
      file.buffer,
      folder,
      resourceType,
    );

    // Nếu isPrimary = true → bỏ primary của các file cũ cùng entity
    if (dto.isPrimary) {
      await this.mediaRepo.update(
        { entityType: dto.entityType, entityId: dto.entityId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const media = this.mediaRepo.create({
      entityType: dto.entityType,
      entityId: dto.entityId,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType,
      description: dto.description,
      isPrimary: dto.isPrimary ?? false,
    });

    return this.mediaRepo.save(media);
  }

  // ─── Find by entity ───────────────────────────────────────────────────────────

  async findByEntity(query: QueryMediaDto): Promise<MediaFile[]> {
    const where: any = {
      entityType: query.entityType,
      entityId: query.entityId,
    };
    if (query.fileType) where.fileType = query.fileType;

    return this.mediaRepo.find({
      where,
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  // ─── Find one ─────────────────────────────────────────────────────────────────

  async findOne(id: string): Promise<MediaFile> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException(`Media #${id} not found`);
    return media;
  }

  // ─── Update (description / isPrimary) ────────────────────────────────────────

  async update(id: string, dto: UpdateMediaDto): Promise<MediaFile> {
    const media = await this.findOne(id);

    if (dto.isPrimary) {
      await this.mediaRepo.update(
        { entityType: media.entityType, entityId: media.entityId, isPrimary: true },
        { isPrimary: false },
      );
    }

    Object.assign(media, dto);
    return this.mediaRepo.save(media);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const media = await this.findOne(id);

    // Xóa file trên Cloudinary
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: this.toResourceType(media.fileType as any),
    });

    await this.mediaRepo.remove(media);
  }

  // ─── Delete tất cả media của 1 entity ────────────────────────────────────────

  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    const files = await this.mediaRepo.find({
      where: { entityType: entityType as any, entityId },
    });

    await Promise.all(
      files.map((f) =>
        cloudinary.uploader.destroy(f.publicId, {
          resource_type: this.toResourceType(f.fileType as any),
        }),
      ),
    );

    await this.mediaRepo.remove(files);
  }
}