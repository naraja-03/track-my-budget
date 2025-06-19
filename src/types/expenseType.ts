export type ExpenseType =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "other";

export interface ExpenseItem {
  type: ExpenseType;
  category: string;
  amount: number;
  note?: string;
  createdAt?: string;
}

export interface DayExpense {
  date: string; // e.g. "2025-06-20"
  items: ExpenseItem[];
}
