import { useState, useEffect, useCallback } from "react";
import { DEFAULT_PRODUCTS } from "@/constants/products";
import { PRODUCTS_STORAGE_KEY } from "@/constants/constants";

export const useProducts = () => {
  const [products, setProducts] = useState<string[]>([]);

  // Load products from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge default products with stored ones, removing duplicates
        const merged = [...new Set([...DEFAULT_PRODUCTS, ...parsed])];
        setProducts(merged.sort());
      } catch {
        setProducts([...DEFAULT_PRODUCTS].sort());
      }
    } else {
      setProducts([...DEFAULT_PRODUCTS].sort());
    }
  }, []);

  // Add a new product
  const addProduct = useCallback((productName: string) => {
    const trimmed = productName.trim();
    if (!trimmed) return false;

    setProducts((prev) => {
      // Check if already exists (case-insensitive)
      if (prev.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }

      const updated = [...prev, trimmed].sort();

      // Store only user-added products (those not in defaults)
      const userAdded = updated.filter(
        (v) =>
          !DEFAULT_PRODUCTS.some((d) => d.toLowerCase() === v.toLowerCase()),
      );
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(userAdded));

      return updated;
    });

    return true;
  }, []);

  return { products, addProduct };
};
