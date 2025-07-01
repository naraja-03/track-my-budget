type ExpenseItem = {
  category: string;
  amount: number;
  note?: string;
};
type DayExpense = {
  date: string;
  items: ExpenseItem[];
};

interface Props {
  days: DayExpense[];
  loading: boolean;
  onDayClick?: (day: DayExpense) => void;
}

export default function ExpenseDaysList({ days, loading, onDayClick }: Props) {
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  if (!days || days.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <div className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
          No expense records found for this period.
        </div>
        <div className="text-base sm:text-lg md:text-xl">
          Start tracking your spending to gain valuable insights and better manage your finances.
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 lg:gap-3 mt-6">
      {days.map((day) => (
        <div 
          key={day.date} 
          id={day.date} 
          className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-all duration-200 group"
          onClick={() => onDayClick?.(day)}
          title="Click to edit expenses for this day"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
              {day.date}
            </div>
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              ✏️
            </span>
          </div>
          <ul className="space-y-1 max-h-20 overflow-y-auto">
            {day.items.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex justify-between py-0.5 text-xs border-b last:border-b-0 border-gray-100">
                <span className="truncate pr-2">
                  {item.category}
                </span>
                <span className="font-medium text-blue-600 font-mono whitespace-nowrap">₹{item.amount}</span>
              </li>
            ))}
            {day.items.length > 3 && (
              <li className="text-xs text-gray-400 text-center py-0.5">
                +{day.items.length - 3} more
              </li>
            )}
          </ul>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-blue-700 font-mono">
                ₹{day.items.reduce((sum, item) => sum + item.amount, 0)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}