import { useRouter } from "next/router";
import { useState } from "react";
import { MonthExpenseHeader } from "@/components/MonthExpenseHeader";
import { ExpenseDaysList } from "@/components/ExpenseDaysList";
import { ExpenseFooter } from "@/components/ExpenseFooter";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { DayExpenseModal } from "@/components/DayExpenseModal";
import { useGetExpensesByMonthQuery, useUpdateMutation } from "@/service/query/endpoints/ExpenseApi";

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
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showDayExpenseModal, setShowDayExpenseModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayExpense | null>(null);

  // Use RTK Query to fetch expenses by month
  const { data, isLoading } = useGetExpensesByMonthQuery(
    {
      monthName: typeof month === "string" ? month : "",
      yearNum: year,
    },
    {
      skip: typeof month !== "string" || !monthNames.some(m => m.toLowerCase() === month.toLowerCase()),
    }
  );

  const [updateExpense] = useUpdateMutation();

  const days = data?.items || [];
  const target = data?.target ?? null;

  // Handle adding new expense
  const handleAddExpense = async (expense: { title: string; amount: number; date: string; description: string }) => {
    try {
      await updateExpense({
        date: expense.date,
        newItem: {
          category: expense.title,
          amount: expense.amount,
          note: expense.description,
        },
      }).unwrap();
      
      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]); // Success vibration pattern
      }
      
      setShowAddExpenseModal(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      
      // Error feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200); // Error vibration
      }
    }
  };

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

  // Handle day click for editing
  const handleDayClick = (day: DayExpense) => {
    setSelectedDay(day);
    setShowDayExpenseModal(true);
  };

  // Handle closing day expense modal
  const handleCloseDayModal = () => {
    setShowDayExpenseModal(false);
    setSelectedDay(null);
  };

  const total =
    days?.reduce(
      (sum, d) => sum + d.items.reduce((s, i) => s + i.amount, 0),
      0
    ) ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 pb-20 p-4">
      <MonthExpenseHeader month={typeof month === "string" ? month : ""} year={year} onChangeMonth={changeMonth} />
      <ExpenseDaysList days={days} loading={isLoading} onDayClick={handleDayClick} />
      <ExpenseFooter 
        total={total} 
        target={target}
        month={`${year}-${String(monthNames.findIndex(m => m.toLowerCase() === String(month).toLowerCase()) + 1).padStart(2, "0")}`}
        onAddExpense={() => setShowAddExpenseModal(true)}
      />
      <AddExpenseModal
        open={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSubmit={handleAddExpense}
      />
      <DayExpenseModal
        dayExpense={selectedDay}
        isOpen={showDayExpenseModal}
        onClose={handleCloseDayModal}
      />
    </main>
  );
}