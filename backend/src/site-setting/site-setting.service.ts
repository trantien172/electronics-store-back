import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from './entity/Site-setting.entity';
import {
  CreateSettingDto,
  UpdateSettingDto,
  BulkUpdateSettingDto,
} from './dto/site-settings.dto';

@Injectable()
export class SiteSettingService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepo: Repository<SiteSetting>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────────

  async create(dto: CreateSettingDto, userId: number): Promise<SiteSetting> {
    const existing = await this.settingsRepo.findOne({
      where: { settingKey: dto.settingKey },
    });
    if (existing) {
      throw new ConflictException(`Setting key '${dto.settingKey}' already exists`);
    }

    const setting = this.settingsRepo.create({ ...dto, updatedBy: userId });
    return this.settingsRepo.save(setting);
  }

  // ─── Find All ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<SiteSetting[]> {
    return this.settingsRepo.find({ order: { settingKey: 'ASC' } });
  }

  // ─── Find by key ──────────────────────────────────────────────────────────────

  async findByKey(key: string): Promise<SiteSetting> {
    const setting = await this.settingsRepo.findOne({
      where: { settingKey: key },
    });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  // ─── Find one by id ───────────────────────────────────────────────────────────

  async findOne(id: number): Promise<SiteSetting> {
    const setting = await this.settingsRepo.findOne({ where: { id } });
    if (!setting) throw new NotFoundException(`Setting #${id} not found`);
    return setting;
  }

  // ─── Update by key ────────────────────────────────────────────────────────────

  async update(
    key: string,
    dto: UpdateSettingDto,
    userId: number,
  ): Promise<SiteSetting> {
    const setting = await this.findByKey(key);
    Object.assign(setting, { ...dto, updatedBy: userId });
    return this.settingsRepo.save(setting);
  }

  // ─── Bulk update ──────────────────────────────────────────────────────────────

  async bulkUpdate(
    items: BulkUpdateSettingDto[],
    userId: number,
  ): Promise<SiteSetting[]> {
    const results: SiteSetting[] = [];

    for (const item of items) {
      const setting = await this.settingsRepo.findOne({
        where: { settingKey: item.settingKey },
      });
      if (!setting) continue; // bỏ qua key không tồn tại

      setting.settingValue = item.settingValue ?? setting.settingValue;
      setting.updatedBy = userId;
      results.push(await this.settingsRepo.save(setting));
    }

    return results;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  async delete(key: string): Promise<void> {
    const setting = await this.findByKey(key);
    await this.settingsRepo.remove(setting);
  }

  // ─── Get value trực tiếp (dùng nội bộ trong các service khác) ────────────────

  async getValue(key: string, fallback?: string): Promise<string | null> {
    const setting = await this.settingsRepo.findOne({
      where: { settingKey: key },
    });
    return setting?.settingValue ?? fallback ?? null;
  }
}