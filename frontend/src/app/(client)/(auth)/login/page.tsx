"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useVietnameseName } from '@/hooks/useNameValidator'
import { Eye, EyeOff, Wrench, ShieldCheck, Clock, Star, LogIn, UserPlus } from "lucide-react";
import { usePasswordRules } from '@/hooks/usePasswordStrength';
import { usePhoneValidator } from '@/hooks/usePhoneValidator';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field, FieldError, FieldLabel } from "@/components/ui/Field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AuthService } from "@/service/auth.service";
import { apiErrorMessage } from "@/lib/api-error";

type Tab = "login" | "register";
type Role = "client" | "worker";

// ── Login Form ────────────────────────────────────────────
function LoginForm() {
  const [showPw, setShowPw] = useState(false);

  const { login } = useAuth();
  const { phoneNumber: phone, onChange: setPhone, isValid: isValidPhone } = usePhoneValidator();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async (isPhoneValid: boolean) => {
    if (password === '') {
      setPasswordError('Không được để trống');
      return
    }
    if (!isPhoneValid)
      return;
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPasswordError(message || 'Số điện thoại hoặc mật khẩu không đúng.');

    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-medium text-foreground">
          Chào mừng trở lại
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhập thông tin để tiếp tục
        </p>
      </div>

      <Field data-invalid={!isValidPhone || Boolean(phoneError)}>
        <FieldLabel htmlFor="login-phone">Số điện thoại</FieldLabel>
        <Input id="login-phone" value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setPhoneError('')
          }}
          type="tel"
          aria-invalid={!isValidPhone || Boolean(phoneError)}
          placeholder="0987654321"
          autoComplete="tel"
        />
        <FieldError>{!isValidPhone ? 'Phải là số điện thoại' : phoneError}</FieldError>
      </Field>

      <Field data-invalid={Boolean(passwordError)}>
        <FieldLabel htmlFor="pw-login">Mật khẩu</FieldLabel>
        <div className="relative">
          <Input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError('')
            }}
            id="pw-login"
            type={showPw ? "text" : "password"}
            className="pr-12"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-0 top-0 text-muted-foreground"
            aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>

        </div>
        <FieldError>{passwordError}</FieldError>
        <div className="flex justify-end mt-1.5">
          <Link
            href="/forgot-password"
            className="text-xs text-primary-600 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </Field>

      <Button
        type="button"
        onClick={() => handleLogin(isValidPhone)}
        disabled={loading}
        className="w-full"
      >
        <LogIn size={16} />
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => { window.location.href = AuthService.googleLoginUrl(); }}>
        <GoogleIcon />
        Tiếp tục với Google
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Bằng cách đăng nhập, bạn đồng ý với{" "}
        <Link href="/terms" className="text-primary-600 hover:underline">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="/privacy" className="text-primary-600 hover:underline">
          Chính sách bảo mật
        </Link>.
      </p>
    </div>
  );
}

// ── Register Form ─────────────────────────────────────────
function RegisterForm() {
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Role>("client");
  const { value: firstname, error: firstnameError, isValid: isFirstnameValid, onChange: setFirstname } = useVietnameseName();
  const { value: lastname, error: lastnameError, isValid: isLastnameValid, onChange: setLastname } = useVietnameseName();
  const phoneInput = usePhoneValidator();
  const passwordInput = usePasswordRules();

  const { register } = useAuth();
  const [errorExistPhone, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const handleRegister = async (isValid: boolean) => {
    if (!isValid)
      return;
    setError("");
    setLoading(true);
    try {
      await register(phoneInput.phoneNumber, passwordInput.password, `${lastname.trim()} ${firstname.trim()}`, otp);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Lỗi đăng kí tài khoản");
    } finally {
      setLoading(false);
    }
  }
  const roles: { value: Role; icon: string; label: string }[] = [
    { value: "client", icon: "👤", label: "Khách hàng" },
    { value: "worker", icon: "🔧", label: "Kỹ thuật viên" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-medium text-foreground">
          Tạo tài khoản mới
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Điền thông tin bên dưới để bắt đầu
        </p>
      </div>

      {/* Role selector */}
      <Field>
        <FieldLabel>Bạn là</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((r) => (
            <Button
              disabled={r.value == 'worker'}
              key={r.value}
              type="button"
              variant={role === r.value ? "secondary" : "outline"}
              onClick={() => setRole(r.value)}
              className="h-auto min-h-20 flex-col gap-1.5 py-3"
            >
              <span className="text-xl">{r.icon}</span>
              {r.label}
            </Button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="register-lastname">Họ</FieldLabel>
          <Input id="register-lastname" type="text" placeholder="Nguyễn"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <FieldError>{isLastnameValid ? undefined : lastnameError}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="register-firstname">Tên</FieldLabel>
          <Input id="register-firstname" type="text" placeholder="Văn A"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <FieldError>{isFirstnameValid ? undefined : firstnameError}</FieldError>
        </Field>

      </div>

      <Field data-invalid={!phoneInput.isValid || Boolean(errorExistPhone)}>
        <FieldLabel htmlFor="register-phone">Số điện thoại</FieldLabel>
        <Input id="register-phone"
          value={phoneInput.phoneNumber}
          onChange={(e) => {
            phoneInput.onChange(e.target.value)
            setError('')
          }}
          type="tel" placeholder="0912345678" aria-invalid={!phoneInput.isValid || Boolean(errorExistPhone)} />
        <FieldError>{!phoneInput.isValid ? "Phải là số điện thoại" : errorExistPhone}</FieldError>

      </Field>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Field>
          <FieldLabel htmlFor="register-otp">Mã OTP</FieldLabel>
          <Input id="register-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6 chữ số" />
          <FieldError>{otpMessage}</FieldError>
        </Field>
        <Button type="button" variant="outline" className="mt-7" disabled={!phoneInput.isValid || loading} onClick={async () => { setOtpMessage(""); try { const result = await AuthService.sendOtp(phoneInput.phoneNumber); setOtpSent(true); setOtpMessage(result.mockOtp ? `Mã thử nghiệm: ${result.mockOtp}` : "Mã OTP đã được gửi."); } catch (error: unknown) { setOtpMessage(apiErrorMessage(error, "Không gửi được OTP.")); } }}>Gửi OTP</Button>
      </div>

      <Field data-invalid={passwordInput.isTouched && !passwordInput.isValid}>
        <FieldLabel>Mật khẩu</FieldLabel>
        <div className="relative">
          <Input
            value={passwordInput.password}
            onChange={(e) => {
              passwordInput.setPassword(e.target.value)
              passwordInput.setTouched(true);
            }}
            type={showPw ? "text" : "password"}
            className="pr-12"
            placeholder="Tối thiểu 8 ký tự"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-0 top-0 text-muted-foreground"
            aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>

        </div>
        <FieldError>{passwordInput.isTouched && !passwordInput.rules.isLengthValid ? '8 - 16 kí tự' : undefined}</FieldError>
        <FieldError>{passwordInput.isTouched && !passwordInput.rules.hasNumber ? 'Phải chứa số' : undefined}</FieldError>
        <FieldError>{passwordInput.isTouched && !passwordInput.rules.hasSpecialChar ? 'Phải có kí tự đặc biệt' : undefined}</FieldError>
      </Field>

      <Button
        type="button"
        onClick={() => handleRegister(isFirstnameValid && isLastnameValid && passwordInput.isValid && phoneInput.isValid && otpSent && otp.length === 6)}
        disabled={loading || !otpSent || otp.length !== 6}
        className="w-full"
      ><UserPlus size={16} />
        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
      </Button>
    </div>
  );
}


// ── Left Panel ────────────────────────────────────────────
function LeftPanel() {
  const trustItems = [
    { icon: ShieldCheck, text: "Bảo hành thiết bị sau sửa chữa" },
    { icon: Clock, text: "Cập nhật tiến độ theo thời gian thực" },
    { icon: Star, text: "Thợ kỹ thuật được kiểm định" },
  ];

  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden bg-surface-dark p-10 md:flex md:w-[42%]"
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-primary/10"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/10"
      />

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary"
        >
          <Wrench size={18} className="text-surface-dark" />
        </div>
        <span className="text-lg font-medium text-primary-100">
          FixPro
        </span>
      </div>

      {/* Tagline */}
      <div className="z-10">
        <p className="mb-3 text-2xl font-medium leading-snug text-white">
          Sửa chữa nhanh —<br />Uy tín đặt lên đầu.
        </p>
        <p className="text-sm leading-relaxed text-neutral-200">
          Theo dõi đơn sửa chữa, nhận thông báo tiến độ và thanh toán dễ dàng mọi lúc mọi nơi.
        </p>
      </div>

      {/* Trust signals */}
      <div className="flex flex-col gap-3 z-10">
        {trustItems.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <Icon size={15} className="shrink-0 text-primary" />
            <span className="text-sm text-neutral-200">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Google Icon ───────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4.5 24 4.5 13.3 4.5 4.5 13.3 4.5 24S13.3 43.5 24 43.5c10.5 0 19.5-7.6 19.5-19.5 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4.5 24 4.5c-7.6 0-14.2 4.3-17.7 10.2z" />
      <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35 26.8 36 24 36c-5.2 0-9.6-3-11.4-7.3l-6.5 5C9.7 39.2 16.4 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.2-4.5 5.5l6.2 5.2c3.6-3.3 5.9-8.2 5.9-14.2 0-1.3-.1-2.7-.4-4z" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4"
    >
      <div
        className="flex w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-card"
      >
        <LeftPanel />

        {/* Right */}
        <div className="flex-1 p-8 md:p-10 flex flex-col">
          {/* Tabs */}
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
            <TabsList variant="line" className="mb-7 w-full justify-start rounded-none border-b border-border p-0">
            {(["login", "register"] as Tab[]).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="-mb-px flex-none rounded-none px-4 text-muted-foreground data-active:text-primary-600"
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </TabsTrigger>
            ))}
            </TabsList>
          </Tabs>

          <form onSubmit={(e) => e.preventDefault()} className="flex-1">
            {tab === "login" ? <LoginForm /> : <RegisterForm />}
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {tab === "login" ? (
              <>Chưa có tài khoản?{" "}
                <Button
                  onClick={() => setTab("register")}
                  variant="link"
                  className="h-auto min-h-0 p-0 text-primary-600"
                >
                  Đăng ký ngay
                </Button>
              </>
            ) : (
              <>Đã có tài khoản?{" "}
                <Button
                  onClick={() => setTab("login")}
                  variant="link"
                  className="h-auto min-h-0 p-0 text-primary-600"
                >
                  Đăng nhập
                </Button>
              </>
            )}
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Quản trị cửa hàng?{" "}
            <Link href="/dashboard-login" className="font-medium text-primary-600 hover:underline">
              Đăng nhập Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
