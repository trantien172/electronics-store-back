"use client";
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { AuthService } from '@/service/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiErrorMessage } from '@/lib/api-error';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState(''); const [otp, setOtp] = useState(''); const [password, setPassword] = useState('');
  const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  async function sendOtp() { try { const data = await AuthService.sendOtp(phone, 'reset'); setNotice(data.mockOtp ? `Mã OTP thử nghiệm: ${data.mockOtp}` : 'Mã OTP đã được gửi.'); } catch (error: unknown) { setNotice(apiErrorMessage(error, 'Không gửi được OTP.')); } }
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await api.post('/auth/password-reset', { phone, otp, purpose: 'reset', password }); setNotice('Đổi mật khẩu thành công. Bạn có thể đăng nhập.'); } catch (error: unknown) { setNotice(apiErrorMessage(error, 'Không thể đặt lại mật khẩu.')); } finally { setBusy(false); } }
  return <main className="mx-auto max-w-lg px-4 py-16"><form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6"><h1 className="text-2xl font-semibold">Đặt lại mật khẩu</h1><label className="block text-sm">Số điện thoại<Input className="mt-2" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} /></label><div className="grid grid-cols-[1fr_auto] gap-2"><label className="block text-sm">Mã OTP<Input className="mt-2" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} /></label><Button type="button" variant="outline" className="mt-6" onClick={sendOtp}>Gửi OTP</Button></div><label className="block text-sm">Mật khẩu mới<Input className="mt-2" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{notice && <p className="text-sm text-primary-700">{notice}</p>}<Button disabled={busy || otp.length !== 6} className="w-full">{busy ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</Button><Link className="block text-center text-sm underline" href="/login">Quay lại đăng nhập</Link></form></main>;
}
