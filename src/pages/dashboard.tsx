import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PlusIcon, CurrencyRupeeIcon, TrashIcon, ArrowRightOnRectangleIcon, CogIcon } from "@heroicons/react/24/solid";
import { AddCustomProjectModal } from "@/components/AddCustomProjectModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { SEOHead } from "@/components/SEOHead";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
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
    slug?: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [plusModalOpen, setPlusModalOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // For confirmation modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Hooks must be called before any early returns
    const { data, refetch } = useGetCustomExpensesQuery();
    const customExpenses: CustomExpense[] = data?.items || [];
    const [addCustomExpense] = useAddCustomExpenseMutation();
    const [deleteCustomExpense] = useDeleteCustomExpenseMutation();

    // Redirect to login if not authenticated or check user status
    useEffect(() => {
        if (status === "loading") return; // Still loading
        if (!session) {
            router.push("/auth/signin");
            return;
        }
        
        // Check if user is pending approval
        if (session.user?.status === 'pending') {
            toast.error("Your account is pending approval. Please contact an administrator.");
            signOut({ callbackUrl: "/auth/signin" });
            return;
        }
        
        if (session.user?.status === 'rejected') {
            toast.error("Your account has been rejected. Please contact an administrator.");
            signOut({ callbackUrl: "/auth/signin" });
            return;
        }
    }, [session, status, router]);

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Show nothing if not authenticated (will redirect)
    if (!session || session.user?.status !== 'active') {
        return null;
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/signin" });
    };

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
        <>
            <SEOHead
                title="Dashboard"
                description="Manage your monthly and custom expenses from your personal finance dashboard"
                canonical="/dashboard"
            />
            
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-10 pb-24 px-4 flex flex-col items-center">
                {/* User Header */}
                <div className="w-full max-w-md mb-6">
                    <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">
                                    {session?.user?.name || "User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {session?.user?.email}
                                </div>
                                {session?.user?.role === 'admin' && (
                                    <div className="text-xs text-purple-600 font-medium">
                                        Administrator
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {session?.user?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                                    title="Admin Panel"
                                >
                                    <CogIcon className="w-5 h-5" />
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Sign out"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
                    <p className="text-gray-600">Track your expenses and achieve your financial goals</p>
                </div>
                
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
                        onClick={() => router.push(`/customExpense/${exp.slug || exp._id}`)}
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
        </>
    );
}