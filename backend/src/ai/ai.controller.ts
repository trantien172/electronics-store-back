import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AiService } from './ai.service';
import { SpeechToTextDto, ProductLookupDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../user/enum/role.enum';

@Controller('ai')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // POST /ai/speech-to-text
  // Worker ghi âm mô tả lỗi → chuyển thành text → điền vào form tạo đơn
  @Post('speech-to-text')
  @Roles(Role.WORKER, Role.ADMIN, Role.OWNER)
  @UseInterceptors(
    FileInterceptor('audio', { storage: memoryStorage() }),
  )
  speechToText(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SpeechToTextDto,
  ) {
    return this.aiService.speechToText(file, dto);
  }

  // POST /ai/product-lookup
  // Nhập tên sản phẩm → trả về mô tả + thông số + ảnh
  @Post('product-lookup')
  @Roles(Role.WORKER, Role.ADMIN, Role.OWNER)
  productLookup(@Body() dto: ProductLookupDto) {
    return this.aiService.productLookup(dto);
  }
}