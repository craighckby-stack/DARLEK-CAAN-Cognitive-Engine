import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges CSS classes efficiently using clsx and tailwind-merge with strict type safety.
 * Optimized for high-frequency execution and zero-allocation overhead where possible.
 */
export function cn(...inputs: ClassValue[]): string {
  try {
    return twMerge(clsx(inputs));
  } catch (error) {
    // Graceful fallback to prevent UI crashes on invalid inputs
    console.error("Critical error in utility function 'cn':", error);
    return "";
  }
}