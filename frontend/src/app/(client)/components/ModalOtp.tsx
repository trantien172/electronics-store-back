"use client";

import { useRef, useState, useEffect, useCallback, type ClipboardEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/InputOTP";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

// ── Props ─────────────────────────────────────────────────
interface OtpModalProps {
  isOpen: boolean;
  phone: string;                          // phone thật để mask + gửi lại
  developmentCode?: string;
  verifyLabel?: string;
  onVerify: (otp: string) => Promise<boolean>; // gọi API, trả true nếu đúng
  onResend: () => Promise<void>;          // gọi API gửi lại
  onClose: () => void;
  resendCooldown?: number;                // giây đếm ngược, mặc định 60
}

// ── Mask phone helper ─────────────────────────────────────
function maskphone(phone: string): string {
  return [...phone].map((c, index) => [0, 1, 7, 8, 9].includes(index) ? c : '*').join('');
}

// ── Main Component ────────────────────────────────────────
export default function OtpModal({
  isOpen, phone, developmentCode, verifyLabel = "Xác nhận", onVerify, onResend, onClose, resendCooldown = 60,
}: OtpModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [hasError, setHasError] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "error" | "success" | "" }>({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Timer ─────────────────────────────────────────────
  const startTimer = useCallback((seconds: number) => {
    setCountdown(seconds);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer khi mở modal
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(""));
      setHasError(false);
      setStatusMsg({ text: "", type: "" });
      setVerified(false);
      setLoading(false);
      startTimer(resendCooldown);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen, resendCooldown, startTimer]);

  // Close khi nhấn Escape
  useEffect(() => {
    const handle = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Handlers ──────────────────────────────────────────
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    (nextEmpty !== -1 ? inputRefs.current[nextEmpty] : inputRefs.current[5])?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    const ok = await onVerify(code);
    setLoading(false);
    if (ok) {
      setVerified(true);
      setStatusMsg({ text: "Xác thực thành công!", type: "success" });
    } else {
      setHasError(true);
      setOtp(Array(6).fill(""));
      setStatusMsg({ text: "Mã không đúng. Kiểm tra lại hoặc yêu cầu mã mới.", type: "error" });
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await onResend();
    } catch {
      setStatusMsg({ text: "Không gửi được mã mới. Vui lòng thử lại.", type: "error" });
      setLoading(false);
      return;
    }
    setLoading(false);
    setOtp(Array(6).fill(""));
    setHasError(false);
    setStatusMsg({ text: "Đã gửi mã mới về số điện thoại của bạn.", type: "success" });
    startTimer(resendCooldown);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
    setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
  };

  const isComplete = otp.every((d) => d !== "");
  const otpValue = otp.join("");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm p-8" showCloseButton={false}>
        {/* Header */}
        <div className="text-center mb-2">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary-50">
            <ShieldCheck size={22} className="text-primary-600" />
          </div>
          <DialogHeader>
          <DialogTitle className="mb-1.5 text-center text-lg font-medium">
            Xác thực mã OTP
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Mã gồm 6 số vừa được gửi đến
            <br />
            <span className="font-medium text-foreground">
              {maskphone(phone)}
            </span>
            {developmentCode && <span className="mt-2 block rounded-md bg-warning-bg px-3 py-2 font-medium text-warning">Mã OTP tạm thời: {developmentCode}</span>}
          </DialogDescription>
          </DialogHeader>
        </div>

        {/* 6 OTP cells */}
        <InputOTP ref={(element) => { inputRefs.current[0] = element; }} maxLength={6} value={otpValue} onChange={(value) => {
          const nextOtp = Array(6).fill("");
          value.slice(0, 6).split("").forEach((digit, index) => { nextOtp[index] = digit; });
          setOtp(nextOtp);
          setHasError(false);
          setStatusMsg({ text: "", type: "" });
        }} onPaste={handlePaste} aria-label="Nhập mã OTP 6 chữ số" containerClassName="my-6 justify-center gap-2">
          <InputOTPGroup className="gap-2">
            {otp.map((_, index) => <InputOTPSlot key={index} index={index} aria-invalid={hasError} className="rounded-md border" />)}
          </InputOTPGroup>
        </InputOTP>

        {/* Status */}
        <p
          aria-live="polite"
          className={`mb-3 min-h-[18px] text-center text-sm ${statusMsg.type === "error" ? "text-destructive" : statusMsg.type === "success" ? "text-success" : "text-transparent"}`}
        >
          {statusMsg.text || "."}
        </p>

        {/* Verify button */}
        <Button
          onClick={handleVerify}
          disabled={!isComplete || loading || verified}
          className="w-full"
        >
          {loading ? "Đang xác nhận…" : verified ? "Đã xác nhận ✓" : verifyLabel}
        </Button>

        {/* Resend */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {canResend ? (
            <Button
              onClick={handleResend}
              disabled={loading}
              variant="link"
              className="min-h-11 text-sm text-primary-600"
            >
              Gửi lại mã
            </Button>
          ) : (
            <span>
              Gửi lại mã sau{" "}
              <span className="font-medium text-foreground">
                {countdown}s
              </span>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
