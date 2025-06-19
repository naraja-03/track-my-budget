import { useState } from "react";
import { useRouter } from "next/router";
import { PlusIcon, CurrencyRupeeIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AddCustomProjectModal } from "@/components/AddCustomProjectModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import toast from "react-hot-toast";
import {
    useGetCustomExpensesQuery,
    useAddCustomExpenseMutation,
    useDeleteCustomExpenseMutation,
} from "@/service/query/endpoints/ExpenseApi";

type CustomExpense = {
    _id: string;
    title: string;
    description?: string;
    target?: number;
};

export default function DashboardPage() {
    const router = useRouter();
    const [plusModalOpen, setPlusModalOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // For confirmation modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, refetch } = useGetCustomExpensesQuery();
    const customExpenses: CustomExpense[] = data?.items || [];
    const [addCustomExpense] = useAddCustomExpenseMutation();
    const [deleteCustomExpense] = useDeleteCustomExpenseMutation();

    const handleAddCustomProject = async (project: { name: string; target: number; notes: string }) => {
        try {
            const res = await addCustomExpense({
                title: project.name,
                target: project.target,
                description: project.notes,
            }).unwrap();
            if (res.ok) refetch();
        } catch (error) {
            console.error(error);
        }
        setPlusModalOpen(false);
    };

    // Show confirm modal and set id
    const askDelete = (id: string) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    // Actually delete after confirmation
    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteCustomExpense({ id: deleteId }).unwrap();
            refetch();
            toast.success("Deleted successfully!");
        } catch {
            toast.error("Failed to delete.");
        }
        setConfirmOpen(false);
        setDeleteId(null);
    };

    return (
        <main className="min-h-screen bg-gray-100 pt-10 pb-24 px-4 flex flex-col items-center">
            <h1 className="text-2xl font-semibold mb-8 text-center">Finance Dashboard</h1>
            <div className="flex flex-col gap-5 w-full max-w-md">
                {/* Monthly Expense Card */}
                <div
                    className="bg-white rounded-2xl shadow-md p-6 flex flex-row items-center cursor-pointer hover:shadow-lg transition"
                    onClick={() => router.push("/monthExpense")}
                >
                    <div className="flex-1">
                        <div className="text-lg font-bold mb-1">Monthly Overview</div>
                        <div className="text-gray-500 text-sm">Track your recurring expenses</div>
                    </div>
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path d="M8 17l4 4 4-4m-4-5V3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                {/* Custom Expense Cards */}
                {customExpenses.map(exp => (
                    <div
                        key={exp._id}
                        className="bg-white rounded-2xl shadow-md p-6 flex flex-row items-center cursor-pointer hover:shadow-lg transition group relative"
                        onClick={() => router.push(`/customExpense/${exp._id}`)}
                        onMouseEnter={() => setHoveredId(exp._id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div className="flex-1 pr-10">
                            <div className="text-lg font-bold mb-1">{exp.title}</div>
                            <div className="text-gray-500 text-sm">{exp.description || "Custom project expense"}</div>
                        </div>
                        <CurrencyRupeeIcon className="h-7 w-7 text-amber-600 ml-2" />
                        {/* Delete icon, only visible on hover */}
                        {hoveredId === exp._id && (
                            <button
                                className="absolute top-3 right-3 p-1 rounded-full bg-red-50 hover:bg-red-100 z-10"
                                onClick={e => {
                                    e.stopPropagation();
                                    askDelete(exp._id);
                                }}
                                aria-label="Delete"
                            >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                            </button>
                        )}
                    </div>
                ))}
                {/* Plus Card (always last) */}
                <div
                    className="bg-white rounded-2xl shadow-md p-6 flex flex-row items-center cursor-pointer hover:shadow-lg transition border-2 border-dashed border-blue-200"
                    onClick={() => setPlusModalOpen(true)}
                >
                    <div className="flex-1">
                        <div className="text-lg font-bold mb-1">Add Custom Project</div>
                        <div className="text-gray-500 text-sm">Create a new investment or one-time expense</div>
                    </div>
                    <span className="flex items-center justify-center bg-blue-50 rounded-full p-2">
                        <PlusIcon className="h-7 w-7 text-blue-600" />
                    </span>
                </div>
            </div>
            {/* Modal for adding custom expense */}
            <AddCustomProjectModal
                open={plusModalOpen}
                onClose={() => setPlusModalOpen(false)}
                onSubmit={handleAddCustomProject}
            />
            {/* Confirmation Modal */}
            <ConfirmModal
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete this custom project?"
                description="This action cannot be undone."
            />
        </main>
    );
}