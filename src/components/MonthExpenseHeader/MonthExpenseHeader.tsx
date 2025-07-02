import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";



interface Props {
    month: string;
    year: number;
    onChangeMonth: (delta: number) => void;
}

// Month names for display
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthExpenseHeader({ month, onChangeMonth, year }: Props) {
    // Format month display - if it's in YYYY-MM format, convert to month name
    const getDisplayMonth = (monthParam: string) => {
        // Check if it's in YYYY-MM format (like "2025-01")
        if (monthParam.includes("-") && monthParam.length === 7) {
            const [, monthNum] = monthParam.split("-");
            const monthIndex = parseInt(monthNum, 10) - 1;
            return monthNames[monthIndex] || monthParam;
        }
        
        // If it's already a month name, capitalize it properly
        const monthName = monthNames.find(m => m.toLowerCase() === monthParam.toLowerCase());
        return monthName || monthParam;
    };

    const displayMonth = getDisplayMonth(month);

    return (
        <div className="flex flex-col items-center py-6 relative">
            <div className="flex items-center justify-center gap-4 min-w-[320px]">
                <button
                    aria-label="Previous month"
                    onClick={() => onChangeMonth(-1)}
                    className="p-2 rounded-full hover:bg-gray-200 transition w-10 flex-shrink-0 flex items-center justify-center"
                >
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <span className="flex-1 text-2xl text-center min-w-[140px] font-medium">
                    {displayMonth}
                </span>
                <button
                    aria-label="Next month"
                    onClick={() => onChangeMonth(1)}
                    className="p-2 rounded-full hover:bg-gray-200 transition w-10 flex-shrink-0 flex items-center justify-center"
                >
                    <ChevronRightIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="mt-1 text-4xl tracking-widest text-gray-400 select-none pointer-events-none font-normal">
                {year}
            </div>
        </div>
    );
}