import Link from "next/link";
import { Wrench, Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, ZaloIcon } from "@/components/icon/SocialIcons"
import { Container } from "@/components/layout/Container";
export default function Footer() {
  return (
    <footer className="bg-surface-dark text-neutral-400">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg bg-primary-200"
              >
                <Wrench size={18} className="text-surface-dark" />
              </div>
              <span className="text-lg font-medium text-primary-100">
                FixPro
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              Dịch vụ sửa chữa & bán linh kiện điện tử uy tín. Nhanh chóng, minh bạch, bảo hành rõ ràng.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="text-neutral-400 hover:text-primary-100">
                <FacebookIcon size={18} />
              </a>
              <a href="#" aria-label="Zalo" className="text-neutral-400 hover:text-primary-100">
                <ZaloIcon size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-primary-100">
              Liên kết
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/", label: "Trang chủ" },
                { href: "/services", label: "Dịch vụ sửa chữa" },
                { href: "/products", label: "Sản phẩm" },
                { href: "/about", label: "Giới thiệu" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-primary-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-primary-100">
              Hỗ trợ
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/warranty", label: "Chính sách bảo hành" },
                { href: "/faq", label: "Câu hỏi thường gặp" },
                { href: "/terms", label: "Điều khoản dịch vụ" },
                { href: "/privacy", label: "Chính sách bảo mật" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-400 hover:text-primary-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-primary-100">
              Liên hệ
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary-200" />
                <span>123 Đường ABC, Biên Hòa, Đồng Nai</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-primary-200" />
                <span>0912 345 678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-primary-200" />
                <span>support@fixpro.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-dark2 pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} FixPro. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
