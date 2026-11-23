import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';
import { UploadMediaDto, UpdateMediaDto, QueryMediaDto } from './dto/media.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../user/enum/role.enum';

@Controller('media')
@UseGuards(JwtAuthGuard, RoleGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // POST /media/upload
  // Dùng memoryStorage để lấy buffer rồi stream lên Cloudinary (không lưu disk)
  @Post('upload')
  @Roles(Role.WORKER, Role.ADMIN, Role.OWNER)
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage() }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ) {
    return this.mediaService.upload(file, dto);
  }

  // GET /media?entityType=product&entityId=5&fileType=image
  @Get()
  findByEntity(@Query() query: QueryMediaDto) {
    return this.mediaService.findByEntity(query);
  }

  // GET /media/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  // PATCH /media/:id — cập nhật description hoặc đặt làm primary
  @Patch(':id')
  @Roles(Role.WORKER, Role.ADMIN, Role.OWNER)
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto);
  }

  // DELETE /media/:id — xóa 1 file
  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }

  // DELETE /media/entity/:entityType/:entityId — xóa toàn bộ media của 1 entity
  @Delete('entity/:entityType/:entityId')
  @Roles(Role.ADMIN, Role.OWNER)
  deleteByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.mediaService.deleteByEntity(entityType, entityId);
  }
}