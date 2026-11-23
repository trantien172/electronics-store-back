import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SpeechToTextDto {
  // file audio được nhận qua @UploadedFile(), không cần field ở đây

  @IsOptional()
  @IsString()
  // Hint thêm từ khoá để Whisper nhận dạng đúng hơn
  prompt?: string;
}

export class ProductLookupDto {
  @IsString()
  @IsNotEmpty()
  productName: string; // VD: "iPhone 14 Pro Max", "Samsung Galaxy S24"

  @IsOptional()
  @IsString()
  language?: string; // Ngôn ngữ mô tả trả về, mặc định 'vi'
}