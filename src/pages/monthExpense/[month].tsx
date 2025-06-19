import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { MonthExpenseHeader } from "@/components/MonthExpenseHeader";
import { ExpenseDaysList } from "@/components/ExpenseDaysList";
import { ExpenseFooter } from "@/components/ExpenseFooter";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type ExpenseItem = {
  category: string;
  amount: number;
  note?: string;
};
type DayExpense = {
  date: string;
  items: ExpenseItem[];
};

export default function MonthExpensePage() {
  const router = useRouter();
  const { month } = router.query; // e.g. "June"
  const [year, setYear] = useState(new Date().getFullYear());

  const [days, setDays] = useState<DayExpense[]>([]);
  const [target, setTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch expenses for the month and year
  const fetchExpenses = useCallback(async (monthName: string, yearNum: number) => {
    setLoading(true);
    const monthIdx = monthNames.findIndex(
      m => m.toLowerCase() === monthName.toLowerCase()
    );
    // API expects month as number (1-12)
    const res = await fetch(`/api/expenses?month=${yearNum}-${String(monthIdx + 1).padStart(2, "0")}`);
    const data = await res.json();
    setDays(data.items || []);
    setTarget(data.target ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof month === "string" && monthNames.some(m => m.toLowerCase() === month.toLowerCase())) {
      fetchExpenses(month, year);
    }
  }, [month, year, fetchExpenses]);

  // Month navigation
  const changeMonth = (delta: number) => {
    if (typeof month !== "string") return;
    const monthIdx = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
    let newMonthIdx = monthIdx + delta;
    let newYear = year;
    if (newMonthIdx < 0) {
      newMonthIdx = 11;
      newYear = year - 1;
    } else if (newMonthIdx > 11) {
      newMonthIdx = 0;
      newYear = year + 1;
    }
    setYear(newYear);
    router.push(`/monthExpense/${monthNames[newMonthIdx]}`);
  };

  const total =
    days?.reduce(
      (sum, d) => sum + d.items.reduce((s, i) => s + i.amount, 0),
      0
    ) ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 pb-20 p-4">
      <MonthExpenseHeader month={typeof month === "string" ? month : ""} year={year} onChangeMonth={changeMonth} />
      <ExpenseDaysList days={days} loading={loading} />
      <ExpenseFooter total={total} target={target} month={`${year}-${String(monthNames.findIndex(m => m.toLowerCase() === String(month).toLowerCase()) + 1).padStart(2, "0")}`} />
    </main>
  );
}