"use client";

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import OtpModal from './ModalOtp';
import { useCategory } from '@/hooks/useCategory';
import { useCreateRepair } from '@/hooks/useRepair';
import { useAuthStore } from '@/stores/auth.store';
import { AuthService } from '@/service/auth.service';
import { apiErrorMessage } from '@/lib/api-error';

type Item = { categoryId: string; serviceId: string; deviceModel: string; problemDescription: string };
const blankItem: Item = { categoryId: '', serviceId: '', deviceModel: '', problemDescription: '' };

export function RepairRequestForm({ initialValues, idPrefix = 'repair', variant = 'dark', onSuccess }: {
  initialValues?: { deviceCategory?: string; serviceName?: string; description?: string };
  idPrefix?: string; variant?: 'dark' | 'light'; onSuccess?: () => void;
}) {
  const { data: categories = [] } = useCategory();
  const createRepair = useCreateRepair();
  const user = useAuthStore((state) => state.user);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [item, setItem] = useState<Item>({ ...blankItem, problemDescription: initialValues?.description || '' });
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpDevelopmentCode, setOtpDevelopmentCode] = useState<string>();
  const [submittedCode, setSubmittedCode] = useState('');
  const initialValuesApplied = useRef(false);
  const updateItem = (patch: Partial<Item>) => setItem((current) => ({ ...current, ...patch }));
  const selectedCategory = categories.find((category) => String(category.id) === item.categoryId);
  const services = selectedCategory?.services ?? [];
  const selectedService = services.find((service) => String(service.id) === item.serviceId);

  useEffect(() => {
    if (initialValuesApplied.current || !initialValues?.deviceCategory || !categories.length) return;
    const category = categories.find((entry) => entry.name === initialValues.deviceCategory);
    if (!category) return;
    const service = category.services?.find((entry) => entry.name === initialValues.serviceName);
    initialValuesApplied.current = true;
    setItem((current) => ({
      ...current,
      categoryId: String(category.id),
      serviceId: service ? String(service.id) : '',
    }));
  }, [categories, initialValues?.deviceCategory, initialValues?.serviceName]);

  async function sendOtp() {
    const result = await AuthService.sendOtp(phone.trim(), 'repair');
    setOtpDevelopmentCode(result.mockOtp);
  }

  async function createRequest(otp?: string): Promise<boolean> {
    try {
      const result = await createRepair.mutateAsync({
        contact: phone.trim(),
        name: name.trim(),
        visitAddress: address.trim() || undefined,
        note: note.trim() || undefined,
        ...(otp ? { otp } : {}),
        repairItems: [{
          categoryId: Number(item.categoryId),
          ...(item.serviceId ? { serviceId: Number(item.serviceId) } : {}),
          deviceModel: item.deviceModel.trim() || undefined,
          problemDescription: item.problemDescription.trim(),
        }],
      });
      setSubmittedCode(result.code || '');
      setMessage(`Đã nhận yêu cầu. Mã theo dõi: ${result.code || 'đang chờ cấp mã'}`);
      onSuccess?.();
      return true;
    } catch (error: unknown) {
      setMessage(apiErrorMessage(error, 'Không gửi được yêu cầu. Vui lòng kiểm tra lại thông tin.'));
      return false;
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!name.trim() || phone.trim().length < 7 || !item.categoryId || (services.length > 0 && !item.serviceId) || item.problemDescription.trim().length < 5) {
      setMessage('Vui lòng nhập thông tin liên hệ, loại thiết bị, chọn dịch vụ nếu có và mô tả sự cố (ít nhất 5 ký tự).');
      return;
    }

    const phoneMatchesAccount = authenticated && phone.trim() === user?.phone?.trim();
    if (!phoneMatchesAccount) {
      try {
        await sendOtp();
        setOtpOpen(true);
      } catch (error: unknown) {
        setMessage(apiErrorMessage(error, 'Không gửi được mã OTP. Vui lòng thử lại.'));
      }
      return;
    }

    await createRequest();
  }

  const label = variant === 'dark' ? 'text-primary-100' : 'text-foreground';
  const fieldLabel = `block space-y-1.5 text-sm font-medium leading-5 ${label}`;
  const inputClass = variant === 'dark'
    ? 'border-white/15 bg-black/20 text-neutral-50 shadow-inner placeholder:text-neutral-400 focus-visible:border-primary-200 focus-visible:ring-primary-200/20'
    : '';
  const selectTriggerClass = variant === 'dark'
    ? 'h-11 rounded-lg border-white/15 bg-black/20 text-neutral-50 shadow-inner focus-visible:border-primary-200 focus-visible:ring-primary-200/20 data-placeholder:text-neutral-400 [&_svg]:text-neutral-400'
    : 'h-11 rounded-lg';
  const selectContentClass = variant === 'dark' ? 'border-white/10 bg-surface-dark text-neutral-50' : '';
  const insetPanelClass = variant === 'dark' ? 'border-white/10 bg-black/20 text-neutral-100 shadow-inner' : 'border-border/80 bg-muted/40';
  const insetTextareaClass = variant === 'dark'
    ? 'min-h-28 rounded-lg border-white/15 bg-black/20 text-neutral-50 shadow-inner placeholder:text-neutral-400 focus-visible:border-primary-200 focus-visible:ring-primary-200/20'
    : 'min-h-28 rounded-lg bg-background';
  const messageClass = variant === 'dark'
    ? submittedCode ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-red-300/20 bg-red-400/10 text-red-200'
    : submittedCode ? 'border-success/20 bg-success-bg text-success' : 'border-danger/20 bg-danger-bg text-danger';
  return <>
    <form onSubmit={submit} className="w-full space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${idPrefix}-name`} className={fieldLabel}>Họ tên<Input className={inputClass} id={`${idPrefix}-name`} required minLength={2} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        <label htmlFor={`${idPrefix}-phone`} className={fieldLabel}>Số điện thoại<Input className={inputClass} id={`${idPrefix}-phone`} required minLength={7} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
      </div>
      <label className={fieldLabel}>Địa chỉ tiếp nhận<Input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ nếu cần sửa tại nhà" /></label>

      <section className={`rounded-2xl border p-4 text-foreground sm:p-5 ${insetPanelClass}`}>
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Thông tin thiết bị</h3>
          <p className={`mt-1 text-xs leading-5 ${variant === 'dark' ? 'text-neutral-300' : 'text-muted-foreground'}`}>Mỗi yêu cầu trực tuyến áp dụng cho một thiết bị. Nếu mang nhiều thiết bị đến cửa hàng, nhân viên sẽ tạo chung một phiếu tiếp nhận.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-medium">Loại thiết bị<Select value={item.categoryId || null} onValueChange={(value) => {
            const categoryId = String(value ?? '');
            const categoryServices = categories.find((category) => String(category.id) === categoryId)?.services ?? [];
            updateItem({ categoryId, serviceId: categoryServices.length === 1 ? String(categoryServices[0].id) : '' });
          }}><SelectTrigger aria-label="Loại thiết bị" className={selectTriggerClass}><SelectValue placeholder="Chọn loại thiết bị" /></SelectTrigger><SelectContent className={selectContentClass} alignItemWithTrigger>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent></Select></label>
          <label className="block space-y-1.5 text-sm font-medium">Hãng / model (nếu biết)<Input className={inputClass} value={item.deviceModel} onChange={(e) => updateItem({ deviceModel: e.target.value })} /></label>
        </div>
        <label className="mt-4 block space-y-1.5 text-sm font-medium">Dịch vụ cần hỗ trợ<Select value={item.serviceId || null} onValueChange={(value) => updateItem({ serviceId: String(value ?? '') })} disabled={!item.categoryId || services.length === 0}><SelectTrigger aria-label="Dịch vụ cần hỗ trợ" aria-required={services.length > 0} className={selectTriggerClass}><SelectValue placeholder={item.categoryId ? 'Chọn dịch vụ' : 'Chọn loại thiết bị trước'} /></SelectTrigger><SelectContent className={selectContentClass} alignItemWithTrigger>{services.map((service) => <SelectItem key={service.id} value={String(service.id)}>{service.name}</SelectItem>)}</SelectContent></Select>{item.categoryId && services.length === 0 && <span className="block rounded-lg bg-black/15 px-3 py-2 text-xs font-normal leading-5 text-neutral-300">Chưa có dịch vụ được cấu hình cho loại thiết bị này.</span>}{selectedService?.description && <span className="block rounded-lg bg-white/5 px-3 py-2 text-xs font-normal leading-5 text-neutral-300">{selectedService.description}</span>}</label>
        <label className="mt-4 block space-y-1.5 text-sm font-medium">Mô tả sự cố<Textarea className={insetTextareaClass} required minLength={5} rows={3} value={item.problemDescription} onChange={(e) => updateItem({ problemDescription: e.target.value })} placeholder="Mô tả dấu hiệu, thời điểm và tình trạng thiết bị" /></label>
      </section>

      <label className={fieldLabel}>Ghi chú thêm<Textarea className={variant === 'dark' ? 'min-h-20 rounded-lg border-white/15 bg-black/20 text-neutral-50 shadow-inner placeholder:text-neutral-400 focus-visible:border-primary-200 focus-visible:ring-primary-200/20' : 'min-h-20 rounded-lg bg-background'} rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      {message && <p className={`rounded-lg border px-3.5 py-3 text-sm leading-5 ${messageClass}`} role="status">{message}</p>}
      <a href="tel:0866840075" className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-primary-100 underline decoration-primary-200 underline-offset-4 transition-colors hover:text-primary-200">Liên hệ trực tiếp!</a>
      <Button disabled={createRepair.isPending} className="h-12 w-full rounded-lg text-sm font-semibold shadow-sm transition-transform active:scale-[0.99]" type="submit">{createRepair.isPending ? 'Đang gửi…' : 'Gửi yêu cầu sửa chữa'}</Button>
    </form>

    <OtpModal
      isOpen={otpOpen}
      phone={phone}
      developmentCode={otpDevelopmentCode}
      verifyLabel="Xác thực và gửi yêu cầu"
      onVerify={async (otp) => {
        const success = await createRequest(otp);
        if (success) setOtpOpen(false);
        return success;
      }}
      onResend={sendOtp}
      onClose={() => setOtpOpen(false)}
    />
  </>;
}
