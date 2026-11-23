import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MediaFile } from './entity/Media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MediaFile]),
  ],
  controllers: [MediaController],
  providers: [CloudinaryProvider, MediaService],
  exports: [MediaService], // Export để các module khác (Product, User...) dùng được
})
export class MediaModule {}