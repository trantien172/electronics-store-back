import Providers from "@/components/Providers";
import { Toaster } from "sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <main className="flex min-h-svh flex-col">{children}</main>
      <Toaster />
    </Providers>
  );
}
