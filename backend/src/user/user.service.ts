import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './entity/User.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { AuthIdentity } from './entity/AuthIdentity.entity';
import { CustomerProfile } from './entity/CustomerProfile.entity';
import { DataSource } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private repo: Repository<User>, private dataSource: DataSource) {

    }
    findAll() {
        return this.repo.find();
    }
    findOne(id: number) {
        return this.repo.findOneBy({ id })
    }
    async create(registerDto: RegisterDto) {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.findOneByPhone(registerDto.phone);
        if (existingUser) {
            throw new ConflictException('Số điện thoại này đã được đăng ký!');
        }

        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registerDto.password, salt);

        // 3. Lưu vào Database
        const newUser = this.repo.create({
            ...registerDto,
            password: hashedPassword,
            phoneVerifiedAt: new Date(),
            status: 'ACTIVE',
            role: 'CLIENT',
        } as User);
        const savedUser = await this.repo.save(newUser);
        await this.dataSource.getRepository(CustomerProfile).save({ userId: savedUser.id });
        await this.dataSource.getRepository(AuthIdentity).save({ userId: savedUser.id, provider: 'PHONE_PASSWORD', subject: savedUser.phone, passwordHash: hashedPassword });

        // 4. Trả về thông tin (ẩn mật khẩu)
        const { password, ...result } = savedUser;
        return result;
    }

    async createGoogleVerified(phone: string, name: string, subject: string, providerEmail?: string) {
        const existing = await this.findOneByPhone(phone);
        if (existing) {
            if (!existing.phoneVerifiedAt) throw new ConflictException('Phone number is not verified on the existing account');
            const identityRepo = this.dataSource.getRepository(AuthIdentity);
            const linked = await identityRepo.findOneBy({ provider: 'GOOGLE', subject });
            if (!linked) await identityRepo.save({ userId: existing.id, provider: 'GOOGLE', subject, providerEmail: providerEmail ?? null });
            return existing;
        }
        const runner = this.dataSource.createQueryRunner();
        await runner.connect(); await runner.startTransaction();
        try {
            const user = await runner.manager.save(User, runner.manager.create(User, {
                phone, name, role: 'CLIENT', status: 'ACTIVE', phoneVerifiedAt: new Date(),
                password: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
            }));
            await runner.manager.save(CustomerProfile, { userId: user.id });
            await runner.manager.save(AuthIdentity, { userId: user.id, provider: 'GOOGLE', subject, providerEmail: providerEmail ?? null });
            await runner.commitTransaction();
            return user;
        } catch (error) { await runner.rollbackTransaction(); throw error; }
        finally { await runner.release(); }
    }
    async findOrCreateVerifiedGuest(phone: string, name: string) {
        const existing = await this.findOneByPhone(phone);
        if (existing) {
            if (!existing.phoneVerifiedAt) await this.repo.update(existing.id, { phoneVerifiedAt: new Date() });
            return this.findOne(existing.id);
        }
        const user = await this.repo.save(this.repo.create({
            phone, name, role: 'CLIENT', status: 'UNCLAIMED', phoneVerifiedAt: new Date(),
            password: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
        }));
        await this.dataSource.getRepository(CustomerProfile).save({ userId: user.id });
        return user;
    }
    update(userId: number, data: Partial<User>) {
        return this.repo.update(userId, data)
    }
    delete(userId: number) {
        return this.repo.delete(userId)
    }
    findOneByPhone(phone: string) {
        return this.repo.findOneBy({ phone })
    }
    async getOwnProfile(userId: number) {
        const user = await this.repo.findOne({ where: { id: userId }, relations: { customerProfile: true } });
        if (!user) return null;
        const { password, ...safe } = user;
        return safe;
    }
    async updateOwnProfile(userId: number, data: { name?: string; email?: string | null; address?: string | null; birthday?: string | null }) {
        if (data.name !== undefined || data.email !== undefined) await this.repo.update(userId, { ...(data.name !== undefined ? { name: data.name } : {}), ...(data.email !== undefined ? { email: data.email } : {}) });
        if (data.address !== undefined || data.birthday !== undefined) {
            const profiles = this.dataSource.getRepository(CustomerProfile);
            const profile = await profiles.findOneBy({ userId });
            if (profile) await profiles.update(profile.id, { ...(data.address !== undefined ? { address: data.address } : {}), ...(data.birthday !== undefined ? { birthday: data.birthday } : {}) });
            else await profiles.save({ userId, address: data.address ?? null, birthday: data.birthday ?? null });
        }
        return this.getOwnProfile(userId);
    }
    async changeOwnPassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.findOne(userId);
        if (!user?.password || !await bcrypt.compare(currentPassword, user.password)) throw new UnauthorizedException('Current password is incorrect');
        const hash = await bcrypt.hash(newPassword, 12);
        await this.repo.update(userId, { password: hash });
        await this.dataSource.getRepository(AuthIdentity).update({ userId, provider: 'PHONE_PASSWORD' }, { passwordHash: hash });
        return { success: true };
    }
}
