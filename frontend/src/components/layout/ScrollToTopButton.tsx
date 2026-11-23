"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ScrollToTopButton() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const updateScroll = () => setScrollY(window.scrollY);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [pathname]);

  if (scrollY < 320) return null;

  const hasAccountTabBar = pathname.startsWith("/myprofile") || pathname.startsWith("/account");
  const hasProductQuickActions = pathname.startsWith("/products/") && scrollY > 520;
  const bottomClass = hasAccountTabBar
    ? "bottom-20 lg:bottom-5"
    : hasProductQuickActions
      ? "bottom-24 md:bottom-5"
      : "bottom-5";

  return <Button
    type="button"
    variant="secondary"
    size="icon"
    aria-label="Lên đầu trang"
    title="Lên đầu trang"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className={`fixed right-5 z-40 rounded-full shadow-lg ${bottomClass}`}
  >
    <ArrowUp className="size-5" />
  </Button>;
}
