import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names and resolves conflicting
 * Tailwind CSS utility classes.
 *
 * Example:
 * cn(
 *   "p-4",
 *   isActive && "bg-primary",
 *   className
 * )
 */
export const cn = (
  ...inputs: ClassValue[]
): string => twMerge(clsx(...inputs));