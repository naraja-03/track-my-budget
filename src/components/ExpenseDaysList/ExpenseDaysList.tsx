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
}

export default function ExpenseDaysList({ days, loading }: Props) {
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
    <div className="flex flex-col gap-4 mt-8">
      {days.map((day) => (
        <div key={day.date} id={day.date} className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-2">{day.date}</div>
          <ul>
            {day.items.map((item, idx) => (
              <li key={idx} className="flex justify-between py-1 border-b last:border-b-0">
                <span>
                  {item.category}
                  {item.note && <span className="text-gray-400"> ({item.note})</span>}
                </span>
                <span className="font-medium text-blue-600">₹{item.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}