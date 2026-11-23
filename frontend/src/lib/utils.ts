import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely so local overrides win over component defaults. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
