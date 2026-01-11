import { USERID_STORAGE_KEY } from "@/constants/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserId() {
  return localStorage.getItem(USERID_STORAGE_KEY);
}
