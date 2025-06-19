interface Props {
  total: number;
  target: number | null;
  month: string;
}

export default function ExpenseFooter({ total, target }: Props) {
  const pl = (target ?? 0) - total;
  const plColor = pl > 0 ? "text-green-600" : pl < 0 ? "text-red-600" : "text-gray-600";
  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none z-30">
      <div
        className="pointer-events-auto flex flex-row items-center gap-8 px-8 py-4 rounded-2xl shadow-2xl bg-white/80 backdrop-blur border border-gray-200"
        style={{
          minWidth: 320,
          maxWidth: 420,
        }}
      >
        <div>
          Total: <span className="font-mono text-blue-700">₹{total}</span>
        </div>
        <div>
          Target: <span className="font-mono text-indigo-700">₹{target ?? 0}</span>
        </div>
        <div>
          P/L: <span className={`font-mono ${plColor}`}>₹{pl || "0"}</span>
        </div>
      </div>
    </div>
  );
}