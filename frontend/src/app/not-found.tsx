"use client";

import { NotFoundPage } from "@/components/NotFoundPage";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <NotFoundPage onGoBack={() => router.back()} />
  );
}