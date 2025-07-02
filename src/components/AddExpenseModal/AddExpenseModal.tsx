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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="bg-white p-4 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg sm:h-auto mx-0 sm:mx-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col"
                style={{
                    minWidth: 0,
                    maxHeight: "max-content",
                    overflowY: "hidden",
                    marginTop: "15vh",
                    boxShadow: "0 8px 32px 0 rgba(80,120,255,0.13)",
                }}
            >
                {/* Modal header with drag indicator */}
                <div className="flex items-center justify-center pt-3 pb-2 sm:hidden flex-shrink-0">
                    <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <div className="px-4 pb-4 pt-3 flex-1 flex flex-col">
                    <div className="text-center mb-4 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Expense</h2>
                        <p className="text-sm text-gray-500">Track your spending</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <input
                                type="text"
                                className="w-full px-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                autoFocus
                                placeholder="Food, Transport..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium">₹</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono transition-all hover:border-gray-300"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                    min={0.01}
                                    step={0.01}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                            <input
                                type="text"
                                className="w-full px-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Optional details"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 flex-shrink-0">
                        <button
                            type="button"
                            className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-3 text-base font-medium hover:bg-gray-200 transition-all"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-medium hover:bg-blue-700 transition-all"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
