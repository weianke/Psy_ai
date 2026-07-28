import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并tailwind类名
 * @param inputs
 * @returns
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
