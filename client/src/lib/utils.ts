import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string): string {
  if (!price) return price;
  
  const lowerPrice = price.toLowerCase();
  
  if (lowerPrice === "free" || lowerPrice === "freemium" || lowerPrice === "custom") {
    return price;
  }
  
  if (price.startsWith("$")) {
    return `From ${price}`;
  }
  
  return price;
}
