import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: {
    default: "FixPro | Sửa chữa và mua bán điện tử",
    template: "%s | FixPro",
  },
  description: "Sửa chữa & mua bán điện tử",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body className="flex flex-col min-h-screen">
     
          
        {children}
        <ScrollToTopButton />
       
      </body>
    </html>
  );
}
