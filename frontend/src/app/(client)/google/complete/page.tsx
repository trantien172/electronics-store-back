"use client";

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/service/auth.service';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiErrorMessage } from '@/lib/api-error';

function GoogleCompleteForm() {
  const ticket = useSearchParams().get('ticket') || '';
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [phone, setPhone] = useState(''); const [otp, setOtp] = useState('');
  const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  async function sendOtp() { try { const result = await AuthService.sendOtp(phone, 'google'); setNotice(result.mockOtp ? `Mã OTP thử nghiệm: ${result.mockOtp}` : 'Mã OTP đã được gửi.'); } catch (error: unknown) { setNotice(apiErrorMessage(error, 'Không gửi được OTP.')); } }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    try { const { data } = await api.post('/auth/google/complete', { ticket, phone, otp }); setAuth({ ...data.user, role: String(data.user.role).toLowerCase() }, data.access_token); router.replace('/'); }
    catch (error: unknown) { setNotice(apiErrorMessage(error, 'Không thể hoàn tất đăng nhập Google.')); }
    finally { setBusy(false); }
  }
  if (!ticket) return <main className="mx-auto max-w-lg p-8">Liên kết xác thực Google không hợp lệ.</main>;
  return <main className="mx-auto max-w-lg px-4 py-16"><form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6"><h1 className="text-2xl font-semibold">Xác minh số điện thoại</h1><p className="text-sm text-muted-foreground">Tài khoản Google cần được liên kết với số điện thoại đã xác minh.</p><label className="block text-sm">Số điện thoại<Input className="mt-2" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={7} /></label><div className="grid grid-cols-[1fr_auto] gap-2"><label className="block text-sm">Mã OTP<Input className="mt-2" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required maxLength={6} /></label><Button type="button" variant="outline" className="mt-6" onClick={sendOtp}>Gửi OTP</Button></div>{notice && <p className="text-sm text-primary-700">{notice}</p>}<Button type="submit" disabled={busy || otp.length !== 6} className="w-full">{busy ? 'Đang xác minh…' : 'Liên kết và đăng nhập'}</Button></form></main>;
}

export default function GoogleCompletePage() {
  return <Suspense fallback={<main className="mx-auto max-w-lg p-8">Loading…</main>}><GoogleCompleteForm /></Suspense>;
}
