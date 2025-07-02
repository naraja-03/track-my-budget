import { useRouter } from "next/router";
import { useState } from "react";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ExpenseFooter } from "@/components/ExpenseFooter";
import { ExpenseDaysList } from "@/components/ExpenseDaysList";
import CustomExpenseDayModal from "@/components/CustomExpenseDayModal";
import { 
  useGetCustomExpenseByIdentifierQuery,
  useGetCustomExpenseTransactionsQuery,
  useAddCustomExpenseTransactionMutation
} from "@/service/query/endpoints/ExpenseApi";

type ExpenseItem = {
  _id?: string; // Add transaction ID to track individual items
  category: string;
  amount: number;
  note?: string;
};

type DayExpense = {
  date: string;
  items: ExpenseItem[];
};

type CustomExpense = {
  _id: string;
  title: string;
  description?: string;
  target?: number;
  slug?: string;
};

export default function CustomExpensePage() {
  const router = useRouter();
  const { id } = router.query;
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showDayExpenseModal, setShowDayExpenseModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayExpense | null>(null);

  // Fetch custom expense by identifier (slug or ID)
  const { data: projectData } = useGetCustomExpenseByIdentifierQuery(
    { identifier: id as string },
    { skip: !id }
  );
  const currentProject: CustomExpense | undefined = projectData?.item;

  // Fetch transactions for this custom expense using the actual _id
  const { data: transactionsData } = useGetCustomExpenseTransactionsQuery(
    { customExpenseId: currentProject?._id || '' },
    { skip: !currentProject?._id }
  );
  const [addTransaction] = useAddCustomExpenseTransactionMutation();

  // Process transactions into days format for display
  const transactions = transactionsData?.items || [];
  const days: DayExpense[] = transactions.reduce((acc: DayExpense[], transaction) => {
    const existingDay = acc.find(day => day.date === transaction.date);
    const item: ExpenseItem = {
      _id: transaction._id, // Preserve transaction ID
      category: transaction.category,
      amount: transaction.amount,
      note: transaction.note,
    };

    if (existingDay) {
      existingDay.items.push(item);
    } else {
      acc.push({ date: transaction.date, items: [item] });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const target = currentProject?.target ?? 0;

  // Handle adding new expense
  const handleAddExpense = async (expense: { title: string; amount: number; date: string; description: string }) => {
    if (!id) return;

    try {
      await addTransaction({
        customExpenseId: currentProject?._id || '',
        category: expense.title,
        amount: expense.amount,
        note: expense.description,
        date: expense.date,
      }).unwrap();

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      
      setShowAddExpenseModal(false);
    } catch (error) {
      console.error('Failed to add custom expense transaction:', error);
      
      // Error feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  if (!currentProject) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-4">Project not found</h1>
            <p className="text-gray-500">The project you are looking for does not exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-20 p-4">
      {/* Header - Same as Monthly Expense */}
      <div className="flex flex-col items-center py-6 relative">
        <div className="flex items-center justify-center w-full">
          <span className="text-2xl text-center">
            {currentProject.title}
          </span>
        </div>
        <div className="mt-1 text-4xl tracking-widest text-gray-400 select-none pointer-events-none font-normal">
          ₹{formatAmount(target)}
        </div>
      </div>

      {/* Expense Days List - Same as Monthly Expense (Now with Edit functionality) */}
      <ExpenseDaysList 
        days={days} 
        loading={false} 
        onDayClick={handleDayClick}
      />

      {/* Footer - Same as Monthly Expense with swipe up and long press */}
      <ExpenseFooter 
        total={total} 
        target={target}
        onAddExpense={() => setShowAddExpenseModal(true)}
      />

      {/* Modals */}
      <AddExpenseModal
        open={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSubmit={handleAddExpense}
      />
      <CustomExpenseDayModal
        dayExpense={selectedDay}
        isOpen={showDayExpenseModal}
        onClose={handleCloseDayModal}
        customExpenseId={currentProject?._id || ''}
      />
    </main>
  );
}
