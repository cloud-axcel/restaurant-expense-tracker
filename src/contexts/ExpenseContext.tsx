import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import * as XLSX from 'xlsx';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'sn' | 'total'>) => void;
  deleteExpense: (id: string) => void;
  exportToExcel: () => void;
  importFromExcel: (file: File) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'restaurant_expenses';

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, 'id' | 'sn' | 'total'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      sn: expenses.length + 1,
      total: expense.rate * expense.quantity,
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return filtered.map((e, index) => ({ ...e, sn: index + 1 }));
    });
  };

  const exportToExcel = () => {
    const worksheetData = expenses.map((e) => ({
      'SN': e.sn,
      'Date': e.date,
      'Vendor': e.vendor,
      'Product': e.product,
      'Unit': e.unit,
      'Rate': e.rate,
      'Quantity': e.quantity,
      'Total': e.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `restaurant_expenses_${date}.xlsx`);
  };

  const importFromExcel = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedExpenses: Expense[] = jsonData.map((row: any, index: number) => ({
            id: crypto.randomUUID(),
            sn: index + 1,
            date: row['Date'] || new Date().toISOString().split('T')[0],
            vendor: row['Vendor'] || '',
            product: row['Product'] || '',
            unit: row['Unit'] || '',
            rate: Number(row['Rate']) || 0,
            quantity: Number(row['Quantity']) || 0,
            total: Number(row['Total']) || (Number(row['Rate']) || 0) * (Number(row['Quantity']) || 0),
          }));

          setExpenses(importedExpenses);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, exportToExcel, importFromExcel }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
