import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt, randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { UserService } from '../user/user.service';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { AuthIdentity } from '../user/entity/AuthIdentity.entity';

@Injectable()
export class AuthService {
  constructor(private readonly users: UserService, private readonly jwt: JwtService, private readonly dataSource: DataSource, @Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async loginWithPhone(phone: string, password: string) {
    const user = await this.users.findOneByPhone(phone);
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('Invalid phone number or password');
    return { ...(await this.issue(user)), user: this.publicUser(user) };
  }

  async register(dto: { phone: string; password: string; name: string; otp: string; purpose: string }) {
    if (dto.purpose !== 'register') throw new BadRequestException('Invalid OTP purpose');
    await this.consumeOtp(dto.phone, dto.otp, dto.purpose);
    if (await this.users.findOneByPhone(dto.phone)) throw new ConflictException('Phone number is already registered');
    const user = await this.users.create({ phone: dto.phone, password: dto.password, name: dto.name, role: 'CLIENT' } as any);
    return { ...(await this.issue(user)), user: this.publicUser(user) };
  }

  async sendOtp(phone: string, purpose: string) {
    // Temporary repair-flow code until an SMS provider is integrated.
    const fixedRepairOtp = purpose === 'repair';
    const code = fixedRepairOtp
      ? '090922'
      : process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_OTP === 'true'
        ? (process.env.DEV_MOCK_OTP_CODE || '123456')
        : randomInt(100000, 1000000).toString();
    await this.redis.set(this.otpKey(phone, purpose), code, 'EX', 300);
    const response: Record<string, unknown> = { success: true, expiresIn: 300 };
    if (fixedRepairOtp || (process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_OTP === 'true')) response.mockOtp = code;
    else if (process.env.OTP_PROVIDER === 'mock') throw new BadRequestException('Mock OTP is disabled outside development');
    return response;
  }

  async verifyOtp(phone: string, otp: string, purpose: string) {
    await this.consumeOtp(phone, otp, purpose);
    const proof = randomUUID();
    await this.redis.set(`otp-proof:${proof}`, `${phone}:${purpose}`, 'EX', 600);
    return { success: true, proof, expiresIn: 600 };
  }

  async resetPassword(phone: string, otp: string, purpose: string, password: string) {
    if (purpose !== 'reset') throw new BadRequestException('Invalid OTP purpose');
    await this.consumeOtp(phone, otp, purpose);
    const user = await this.users.findOneByPhone(phone);
    if (!user) throw new BadRequestException('Account not found');
    await this.users.update(user.id, { password: await bcrypt.hash(password, 12) } as any);
    return { success: true };
  }

  async getPublicUser(id: number) { const user = await this.users.findOne(id); if (!user) throw new UnauthorizedException(); return this.publicUser(user); }

  googleAuthorizationUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID; const callback = process.env.GOOGLE_CALLBACK_URL;
    if (!clientId || !callback) throw new BadRequestException('Google sign-in is not configured');
    const state = randomUUID();
    void this.redis.set(`google-state:${state}`, '1', 'EX', 600);
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({ client_id: clientId, redirect_uri: callback, response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' }).toString();
    return url.toString();
  }

  async finishGoogleCallback(code: string, state: string) {
    if (!await this.redis.getdel(`google-state:${state}`)) throw new UnauthorizedException('Invalid OAuth state');
    const callback = process.env.GOOGLE_CALLBACK_URL;
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code, client_id: process.env.GOOGLE_CLIENT_ID || '', client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: callback || '', grant_type: 'authorization_code',
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const profile = (await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } })).data;
    if (!profile.sub) throw new UnauthorizedException('Google identity could not be verified');
    const ticket = randomUUID();
    await this.redis.set(`google-ticket:${ticket}`, JSON.stringify({ subject: profile.sub, email: profile.email, name: profile.name }), 'EX', 600);
    return ticket;
  }

  async completeGoogle(ticket: string, phone?: string, otp?: string) {
    const raw = await this.redis.get(`google-ticket:${ticket}`);
    if (!raw) throw new UnauthorizedException('Google sign-in ticket expired');
    const profile = JSON.parse(raw);
    const identity = await this.dataSource.getRepository(AuthIdentity).findOne({ where: { provider: 'GOOGLE', subject: profile.subject }, relations: { user: true } });
    if (identity?.user) { await this.redis.del(`google-ticket:${ticket}`); return { ...(await this.issue(identity.user)), user: this.publicUser(identity.user) }; }
    if (!phone || !otp) return { needsPhoneVerification: true };
    await this.consumeOtp(phone, otp, 'google');
    await this.redis.del(`google-ticket:${ticket}`);
    const user = await this.users.createGoogleVerified(phone, profile.name || 'FixPro customer', profile.subject, profile.email);
    return { ...(await this.issue(user)), user: this.publicUser(user) };
  }
  private publicUser(user: any) { const { password, ...safe } = user; return safe; }
  private otpKey(phone: string, purpose: string) { return `otp:${purpose}:${phone}`; }
  private async consumeOtp(phone: string, otp: string, purpose: string) {
    const key = this.otpKey(phone, purpose); const expected = await this.redis.get(key);
    if (!expected || expected !== otp) throw new UnauthorizedException('OTP is invalid or expired');
    await this.redis.del(key);
  }
  private async issue(user: any) {
    const payload = { sub: user.id, phone: user.phone, role: user.role, jti: randomUUID() };
    const access_token = await this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });
    const refresh_token = await this.jwt.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
    return { access_token, refresh_token };
  }
  async logout(token: string) {
    const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET });
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await this.redis.set(`blacklist:${payload.jti}`, '1', 'EX', ttl);
  }
  async refreshTokens(token: string) {
    if (!token) throw new UnauthorizedException('Refresh token missing');
    const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET });
    if (await this.redis.get(`blacklist:${payload.jti}`)) throw new UnauthorizedException('Refresh token revoked');
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await this.redis.set(`blacklist:${payload.jti}`, '1', 'EX', ttl);
    const user = await this.users.findOne(Number(payload.sub));
    if (!user) throw new UnauthorizedException();
    return this.issue(user);
  }
}
