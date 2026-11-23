import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechToTextDto, ProductLookupDto } from './dto/ai.dto';
import FormData from 'form-data';
import axios from 'axios';

// Từ khoá mặc định giúp Whisper nhận dạng đúng hơn trong ngữ cảnh sửa chữa điện tử
const DEFAULT_WHISPER_PROMPT =
  'Sửa chữa điện thoại, máy tính, màn hình, pin, sạc, cảm ứng, loa, camera, iPhone, Samsung, OPPO, Xiaomi, Vivo, realme';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) { }

  // ─── 1. Speech to Text (Groq Whisper) ────────────────────────────────────────

  async speechToText(
    file: Express.Multer.File,
    dto: SpeechToTextDto,
  ): Promise<{ text: string }> {
    if (!file) throw new BadRequestException('No audio file provided');

    const allowedMimes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg', 'video/webm'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Supported: mp3, mp4, wav, webm, ogg',
      );
    }

    // Giới hạn 25MB theo Groq
    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('Audio file too large. Max 25MB');
    }

    try {
      const form = new FormData();
      form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      form.append('model', 'whisper-large-v3');
      form.append('language', 'vi'); // Chỉ định tiếng Việt
      form.append('response_format', 'text');
      form.append(
        'prompt',
        dto.prompt
          ? `${DEFAULT_WHISPER_PROMPT}, ${dto.prompt}`
          : DEFAULT_WHISPER_PROMPT,
      );

      const response = await axios.post(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        form,
        {
          headers: {
            Authorization: `Bearer ${this.config.get('GROQ_API_KEY')}`,
            ...form.getHeaders(),
          },
        },
      );

      return { text: response.data };
    } catch (error: any) {
      this.logger.error('Groq Whisper error', error?.response?.data);
      throw new InternalServerErrorException('Speech to text failed');
    }
  }

  // ─── 2. Product Lookup (Gemini + Google Image Search) ────────────────────────

  async productLookup(dto: ProductLookupDto): Promise<{
    productName: string;
    description: string;
    specs: string;
    imageUrls: string[];
  }> {
    const language = dto.language ?? 'vi';

    const [infoResult, imageResult] = await Promise.allSettled([
      this.fetchProductInfo(dto.productName, language),
      this.fetchProductImages(dto.productName),
    ]);

    const info =
      infoResult.status === 'fulfilled'
        ? infoResult.value
        : { description: '', specs: '' };

    const imageUrls =
      imageResult.status === 'fulfilled' ? imageResult.value : [];

    return {
      productName: dto.productName,
      description: info.description,
      specs: info.specs,
      imageUrls,
    };
  }

  // ─── Gemini: lấy mô tả + thông số kỹ thuật ───────────────────────────────────

  private async fetchProductInfo(
    productName: string,
    language: string,
  ): Promise<{ description: string; specs: string }> {
    const prompt =
      language === 'vi'
        ? `Hãy cung cấp thông tin về sản phẩm điện tử "${productName}" bằng tiếng Việt. 
Chỉ trả về duy nhất định dạng JSON dưới đây, không bao gồm markdown hay văn bản thừa:
{
  "description": "Mô tả ngắn gọn đặc điểm nổi bật của sản phẩm trong 2-3 câu.",
  "specs": "Liệt kê các thông số kỹ thuật quan trọng nhất phù hợp với loại sản phẩm này (ví dụ: công suất, kích thước, công nghệ cốt lõi)."
}`
        : `Provide information for the electronic product "${productName}" in English. 
Return ONLY the following JSON format, without any markdown or extra text:
{
  "description": "A concise description of the product's highlights in 2-3 sentences.",
  "specs": "List the most important technical specifications relevant to this product type (e.g., power, dimensions, core technology)."
}`

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.get('GEMINI_API_KEY')}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        },
      );

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      // Parse JSON từ response
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        description: parsed.description ?? '',
        specs: parsed.specs ?? '',
      };
    } catch (error: any) {
      this.logger.error('Gemini error', error?.response?.data);
      return { description: '', specs: '' };
    }
  }

  // ─── Google Custom Search: lấy ảnh sản phẩm ─────────────────────────────────

  private async fetchProductImages(productName: string): Promise<string[]> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: this.config.get('GOOGLE_SEARCH_API_KEY'),
            cx: this.config.get('GOOGLE_SEARCH_CX'), // Custom Search Engine ID
            q: productName,
            searchType: 'image',
            num: 6, // Lấy 6 ảnh để người dùng chọn
            imgType: 'photo',
            safe: 'active',
          },
        },
      );

      const items = response.data?.items ?? [];
      return items.map((item: any) => item.link).filter(Boolean);
    } catch (error: any) {
      this.logger.error('Google Image Search error', error?.response?.data);
      return [];
    }
  }
}