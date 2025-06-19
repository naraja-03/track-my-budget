import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";



interface Props {
    month: string;
    year: number;
    onChangeMonth: (delta: number) => void;
}

export default function MonthExpenseHeader({ month, onChangeMonth, year }: Props) {

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
                <span className="flex-1 text-2xl text-center min-w-[140px]">
                    {month}
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