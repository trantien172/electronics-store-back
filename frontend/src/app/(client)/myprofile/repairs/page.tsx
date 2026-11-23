"use client";
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Search, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const labels: Record<string,string> = { pending:'Đang chờ tiếp nhận', in_progress:'Đang xử lý', completed:'Đã sửa xong', cancelled:'Đã hủy' };
type RepairListItem = { id: number; status: string; deviceModel?: string | null; problemDescription?: string; category?: { name: string }; };
type RepairListRecord = { id: number; code: string; status: string; createdAt: string; repairItems: RepairListItem[] };
export default function MyRepairsPage() {
  const authenticated = useAuthStore(s => s.isAuthenticated);
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all');
  const { data = [], isLoading, isError } = useQuery<RepairListRecord[]>({ queryKey:['client-repairs'], enabled:authenticated, queryFn:async () => (await api.get<RepairListRecord[]>('/repair/my')).data });
  const rows = useMemo(() => data.filter((r) => (!query || r.code.toLowerCase().includes(query.toLowerCase())) && (status === 'all' || r.status === status)), [data,query,status]);
  return <main className="min-h-[65vh] pb-20"><div className="bg-surface-dark text-white"><Container className="py-8"><Link href="/myprofile" className="inline-flex min-h-10 items-center gap-2 text-sm text-white/70"><ArrowLeft className="size-4"/>Hồ sơ</Link><h1 className="mt-3 text-3xl font-semibold">Phiếu sửa chữa của tôi</h1><p className="mt-2 text-sm text-white/70">Theo dõi thiết bị, trạng thái và báo giá.</p></Container></div><Container className="py-8">
    {!authenticated ? <div className="rounded-xl border p-8 text-center"><p>Đăng nhập để xem các phiếu đã liên kết với tài khoản.</p><Button render={<Link href="/login?returnUrl=%2Fmyprofile%2Frepairs"/>} nativeButton={false} className="mt-4">Đăng nhập</Button></div> : <><div className="grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo mã phiếu"/></label><select className="h-11 rounded-md border bg-card px-3" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Mọi trạng thái</option>{Object.entries(labels).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></div>
    {isLoading ? <p className="py-12 text-center">Đang tải phiếu…</p> : isError ? <p role="alert" className="py-12 text-center text-danger">Không tải được dữ liệu phiếu sửa chữa.</p> : rows.length ? <div className="mt-5 space-y-3">{rows.map((repair)=><article key={repair.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><Link className="font-semibold text-primary-700 hover:underline" href={`/myprofile/repairs/${repair.code}`}>{repair.code}</Link><span className="ml-3 rounded-full bg-muted px-3 py-1 text-xs">{labels[repair.status] || repair.status}</span><p className="mt-2 text-xs text-muted-foreground">{new Date(repair.createdAt).toLocaleString('vi-VN')} · {repair.repairItems?.length || 0} thiết bị</p></div><Button variant="outline" render={<Link href={`/myprofile/repairs/${repair.code}`}/>} nativeButton={false}>Xem chi tiết</Button></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{repair.repairItems?.map((item)=><div key={item.id} className="rounded-lg bg-muted/60 p-3 text-sm"><strong>{item.category?.name || item.deviceModel || 'Thiết bị'}</strong><p className="mt-1 text-muted-foreground">{item.problemDescription}</p><p className="mt-1 text-xs">{item.status}</p></div>)}</div></article>)}</div> : <div className="mt-8 rounded-xl border border-dashed p-10 text-center"><Wrench className="mx-auto size-8 text-muted-foreground"/><h2 className="mt-3 font-semibold">{data.length ? 'Không tìm thấy phiếu phù hợp' : 'Bạn chưa có phiếu sửa chữa'}</h2><p className="mt-2 text-sm text-muted-foreground">Gửi yêu cầu sửa chữa để phiếu xuất hiện tại đây.</p><Button render={<Link href="/services"/>} nativeButton={false} className="mt-4">Xem dịch vụ</Button></div>}</>}
  </Container></main>;
}
