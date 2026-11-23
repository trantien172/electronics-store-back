"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Clock3 } from 'lucide-react';
import api from '@/lib/axios';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';

const statusText:Record<string,string>={pending:'Đang chờ tiếp nhận',in_progress:'Đang xử lý',completed:'Đã hoàn tất',cancelled:'Đã hủy',assigned:'Đã phân công',waiting_parts:'Đang chờ linh kiện',waiting_quote:'Chờ phản hồi báo giá'};
type QuoteLine = { id: string; description: string; quantity: number | string; unitPrice: number | string };
type RepairQuote = { id: string; status: 'pending' | 'accepted' | 'rejected'; amount: number | string; reason?: string | null; lines: QuoteLine[] };
type RepairDevice = { id: number; status: string; deviceModel?: string | null; problemDescription?: string; category?: { name: string }; technician?: { name: string } | null; quotes: RepairQuote[] };
type HistoryEntry = { id: string; toStatus: string; eventType?: string; createdAt: string; note?: string | null };
type RepairDetail = { code: string; status: string; createdAt: string; promisedDate?: string | null; repairItems: RepairDevice[]; history: HistoryEntry[]; itemHistory: HistoryEntry[] };
export default function RepairDetailPage() {
  const code=decodeURIComponent(String(useParams<{repairCode:string}>().repairCode));
  const signedIn=useAuthStore(s=>s.isAuthenticated); const client=useQueryClient();
  const {data:repair,isLoading,isError}=useQuery<RepairDetail>({queryKey:['repair',code],enabled:signedIn,queryFn:async()=> (await api.get<RepairDetail>(`/repair/code/${encodeURIComponent(code)}`)).data});
  async function respond(id:string,action:'accepted'|'rejected') { await api.post(`/repair/quotes/${id}/respond`,{action}); await client.invalidateQueries({queryKey:['repair',code]}); }
  return <main className="min-h-[65vh] pb-16"><div className="bg-surface-dark text-white"><Container className="py-8"><Link href="/myprofile/repairs" className="inline-flex min-h-10 items-center gap-2 text-sm text-white/70"><ArrowLeft className="size-4"/>Phiếu sửa chữa</Link><h1 className="mt-3 text-3xl font-semibold">Chi tiết phiếu {code}</h1></Container></div><Container className="py-8">
    {!signedIn?<div className="rounded-xl border p-8 text-center">Đăng nhập để xem phiếu thuộc tài khoản của bạn.<p><Button render={<Link href={`/login?returnUrl=${encodeURIComponent(`/myprofile/repairs/${code}`)}`}/>} nativeButton={false} className="mt-4">Đăng nhập</Button></p></div>:isLoading?<p className="py-12 text-center">Đang tải chi tiết…</p>:isError||!repair?<div role="alert" className="rounded-xl border p-8 text-center">Không tìm thấy phiếu hoặc phiếu không thuộc tài khoản của bạn.</div>:<>
      <section className="rounded-xl border bg-card p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm text-muted-foreground">Trạng thái phiếu</p><strong>{statusText[repair.status]||repair.status}</strong></div><div><p className="text-sm text-muted-foreground">Ngày tạo</p><strong>{new Date(repair.createdAt).toLocaleString('vi-VN')}</strong></div>{repair.promisedDate&&<div><p className="text-sm text-muted-foreground">Ngày hẹn</p><strong>{new Date(repair.promisedDate).toLocaleString('vi-VN')}</strong></div>}</div></section>
      <section className="mt-6 space-y-4"><h2 className="text-xl font-semibold">Thiết bị, trạng thái và báo giá</h2>{repair.repairItems?.map((item)=><article key={item.id} className="rounded-xl border bg-card p-5"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold">{item.category?.name||'Thiết bị'} {item.deviceModel}</h3><p className="mt-1 text-sm text-muted-foreground">{item.problemDescription}</p></div><span className="h-fit rounded-full bg-muted px-3 py-1 text-xs">{statusText[item.status]||item.status}</span></div><p className="mt-2 text-xs text-muted-foreground">{item.technician?.name?`Kỹ thuật viên: ${item.technician.name}`:'Chưa phân công kỹ thuật viên'}</p>
        {item.quotes?.map((quote)=><section key={quote.id} className="mt-4 rounded-lg border border-primary-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-medium">Báo giá · {quote.status==='pending'?'Chờ phản hồi':quote.status==='accepted'?'Đã chấp nhận':'Đã từ chối'}</h4><strong>{Number(quote.amount).toLocaleString('vi-VN')} ₫</strong></div>{quote.reason&&<p className="mt-2 text-sm text-muted-foreground">{quote.reason}</p>}<ul className="mt-3 divide-y">{quote.lines?.map((line)=><li key={line.id} className="flex justify-between gap-3 py-2 text-sm"><span>{line.description} × {line.quantity}</span><span>{(Number(line.quantity)*Number(line.unitPrice)).toLocaleString('vi-VN')} ₫</span></li>)}</ul>{quote.status==='pending'&&<div className="mt-3 flex gap-2"><Button onClick={()=>respond(quote.id,'accepted')}><Check className="size-4"/>Chấp nhận</Button><Button variant="outline" onClick={()=>respond(quote.id,'rejected')}>Từ chối</Button></div>}</section>)}
      </article>)}</section>
      <section className="mt-8 rounded-xl border bg-card p-5"><h2 className="flex items-center gap-2 font-semibold"><Clock3 className="size-4"/>Lịch sử phiếu</h2><ol className="mt-4 space-y-3">{repair.history?.map((entry)=><li key={entry.id} className="border-l-2 border-primary/40 pl-4"><strong>{statusText[entry.toStatus]||entry.toStatus}</strong><p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString('vi-VN')}</p>{entry.note&&<p className="text-sm">{entry.note}</p>}</li>)}</ol>{repair.itemHistory?.length>0&&<><h3 className="mt-6 font-medium">Cập nhật thiết bị</h3><ol className="mt-3 space-y-3">{repair.itemHistory.map((entry)=><li key={entry.id} className="border-l-2 border-border pl-4"><p className="text-sm">{statusText[entry.toStatus]||entry.eventType}</p><p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString('vi-VN')}</p></li>)}</ol></>}</section>
    </>}
  </Container></main>;
}
