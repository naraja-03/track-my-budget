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

  // Format date to show day and date like "Tue 01-07"
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayMonth = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    return `${dayName} ${dayMonth}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4 mt-6">
      {days.map((day) => (
        <div 
          key={day.date} 
          id={day.date} 
          className={`bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-4 transition-all duration-200 group ${
            onDayClick ? 'cursor-pointer hover:bg-gray-50' : ''
          }`}
          onClick={() => onDayClick?.(day)}
          title={onDayClick ? "Click to edit expenses for this day" : ""}
        >
          {/* Header with date and edit text */}
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium text-base text-gray-900 group-hover:text-blue-600 transition-colors">
              {formatDateHeader(day.date)}
            </div>
            {onDayClick && (
              <div className="text-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                Edit
              </div>
            )}
          </div>

          {/* Expense items */}
          <ul className="space-y-2 mb-3">
            {day.items.slice(0, 4).map((item, idx) => (
              <li key={idx} className="flex justify-between py-1 text-sm">
                <span className="truncate pr-2 text-gray-600">
                  {item.category}
                </span>
                <span className="font-medium text-gray-900 font-mono whitespace-nowrap">
                  ₹{item.amount.toLocaleString()}
                </span>
              </li>
            ))}
            {day.items.length > 4 && (
              <li className="text-xs text-gray-400 text-center py-1">
                +{day.items.length - 4} more items
              </li>
            )}
          </ul>

          {/* Total section */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Total</span>
              <span className="font-semibold text-lg text-gray-900 font-mono">
                ₹{day.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}