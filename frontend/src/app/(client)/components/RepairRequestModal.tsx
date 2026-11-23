"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { RepairRequestForm } from "./RepairRequestForm";

export type RepairRequestPrefill = { deviceCategory?: string; serviceName?: string; description?: string };

export function RepairRequestModal({ initialValues }: { initialValues: RepairRequestPrefill }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary-200 px-5 text-sm font-semibold text-surface-dark transition-colors hover:bg-primary-100">
        Điền form tạo phiếu sửa
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-6 sm:max-w-2xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-semibold">Tạo yêu cầu sửa chữa</DialogTitle>
            <DialogDescription>Thiết bị và mô tả được điền theo bài viết. Hãy kiểm tra dịch vụ, bổ sung thông tin liên hệ rồi gửi yêu cầu.</DialogDescription>
          </DialogHeader>
          <RepairRequestForm initialValues={initialValues} idPrefix="article-repair-form" variant="light" onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
