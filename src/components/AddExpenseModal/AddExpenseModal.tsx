import { useState, useEffect } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (expense: { title: string; amount: number; date: string; description: string }) => void;
}

export default function AddExpenseModal({ open, onClose, onSubmit }: Props) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open) {
            setTitle("");
            setAmount("");
            setDate(new Date().toISOString().split('T')[0]); // Set to today's date
            setDescription("");
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !date) return;
        onSubmit({ title, amount: Number(amount), date, description });
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
            <div
                className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-xs mx-0 sm:mx-4 animate-in slide-in-from-bottom-4 duration-200"
                style={{
                    minWidth: 0,
                    maxHeight: "80vh",
                    overflowY: "auto",
                    marginBottom: "0",
                }}
            >
                {/* Modal header with drag indicator */}
                <div className="flex items-center justify-center pt-2 pb-1">
                    <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                </div>
                
                <div className="px-4 pb-4">
                    <h2 className="font-medium text-base mb-3 text-center">Add Expense</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            className="px-3 py-2.5 rounded-lg bg-gray-50 outline-none border border-transparent focus:border-blue-400 focus:bg-white transition-all text-sm"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            autoFocus
                            placeholder="Category"
                        />
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-gray-50 outline-none border border-transparent focus:border-blue-400 focus:bg-white transition-all text-sm font-mono"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                                min={0.01}
                                step={0.01}
                                placeholder="0"
                            />
                        </div>
                        <input
                            type="date"
                            className="px-3 py-2.5 rounded-lg bg-gray-50 outline-none border border-transparent focus:border-blue-400 focus:bg-white transition-all text-sm"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            className="px-3 py-2.5 rounded-lg bg-gray-50 outline-none border border-transparent focus:border-blue-400 focus:bg-white transition-all text-sm"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Note (optional)"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                className="flex-1 bg-gray-200 text-gray-700 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-300 active:scale-95 transition-all"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
