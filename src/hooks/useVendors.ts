import { useState, useEffect, useCallback } from "react";
import { DEFAULT_VENDORS } from "@/constants/vendors";
import { VENDORS_STORAGE_KEY } from "@/constants/constants";

export const useVendors = () => {
  const [vendors, setVendors] = useState<string[]>([]);

  // Load vendors from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(VENDORS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge default vendors with stored ones, removing duplicates
        const merged = [...new Set([...DEFAULT_VENDORS, ...parsed])];
        setVendors(merged.sort());
      } catch {
        setVendors([...DEFAULT_VENDORS].sort());
      }
    } else {
      setVendors([...DEFAULT_VENDORS].sort());
    }
  }, []);

  // Add a new vendor
  const addVendor = useCallback((vendorName: string) => {
    const trimmed = vendorName.trim();
    if (!trimmed) return false;

    setVendors((prev) => {
      // Check if already exists (case-insensitive)
      if (prev.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }

      const updated = [...prev, trimmed].sort();

      // Store only user-added vendors (those not in defaults)
      const userAdded = updated.filter(
        (v) =>
          !DEFAULT_VENDORS.some((d) => d.toLowerCase() === v.toLowerCase()),
      );
      localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(userAdded));

      return updated;
    });

    return true;
  }, []);

  return { vendors, addVendor };
};
