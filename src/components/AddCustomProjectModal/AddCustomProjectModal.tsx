import { useState, useEffect } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (project: { name: string; target: number; notes: string }) => void;
}

export default function AddCustomProjectModal({ open, onClose, onSubmit }: Props) {
    const [name, setName] = useState("");
    const [target, setTarget] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            setName("");
            setTarget("");
            setNotes("");
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target) return;
        onSubmit({ name, target: Number(target), notes });
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg sm:h-auto mx-0 sm:mx-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col"
                style={{
                    minWidth: 0,
                    maxHeight: "max-content",
                    overflowY: "hidden",
                    marginTop: "15vh",
                    boxShadow: "0 8px 32px 0 rgba(80,120,255,0.13)",
                }}
            >
                {/* Mobile drag indicator */}
                <div className="flex items-center justify-center pt-3 pb-2 sm:hidden flex-shrink-0">
                    <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <div className="px-4 py-2 flex-1 flex flex-col">
                    <h2 className="font-bold text-lg mb-2 text-center">Add Custom Project</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 flex-1">
                        <div className="flex-1 space-y-2">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-700">Expense Name</span>
                                <input
                                    type="text"
                                    className="px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-700">Target Amount</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base font-mono"
                                        value={target}
                                        onChange={e => setTarget(e.target.value)}
                                        required
                                        min={1}
                                        placeholder="0"
                                    />
                                </div>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-700">Notes</span>
                                <input
                                    type="text"
                                    className="px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Optional"
                                />
                            </label>
                        </div>
                        <div className="flex gap-3 pt-2 flex-shrink-0">
                            <button
                                type="button"
                                className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-3 text-base font-medium hover:bg-gray-200 transition-colors"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-medium hover:bg-blue-700 transition-colors"
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