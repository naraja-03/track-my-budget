import { useState, useEffect } from "react";
import { useUpdateMutation } from "@/service/query/endpoints/ExpenseApi";

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
  dayExpense: DayExpense | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DayExpenseModal({ dayExpense, isOpen, onClose }: Props) {
  const [editingItems, setEditingItems] = useState<ExpenseItem[]>([]);
  const [updateExpense] = useUpdateMutation();

  // Initialize editing items when modal opens
  useEffect(() => {
    if (dayExpense) {
      setEditingItems([...dayExpense.items]);
    }
  }, [dayExpense]);

  if (!isOpen || !dayExpense) return null;

  const handleItemChange = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const newItems = [...editingItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = editingItems.filter((_, i) => i !== index);
    setEditingItems(newItems);
  };

  const handleAddItem = () => {
    setEditingItems([...editingItems, { category: "", amount: 0, note: "" }]);
  };

  const handleSave = async () => {
    try {
      // Filter out empty items
      const validItems = editingItems.filter(item => 
        item.category.trim() && item.amount > 0
      );

      // Update each item (this might need API adjustment for batch updates)
      for (const item of validItems) {
        await updateExpense({
          date: dayExpense.date,
          newItem: item,
        }).unwrap();
      }

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      onClose();
    } catch (error) {
      console.error('Failed to update expenses:', error);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
  };

  const handleClose = () => {
    setEditingItems([...dayExpense.items]);
    onClose();
  };

  const totalAmount = editingItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[75vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-medium text-gray-900">Edit Expenses</h2>
              <p className="text-xs text-gray-500">{dayExpense.date}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-mono font-semibold text-gray-900">₹{totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto max-h-[45vh]">
          <div className="space-y-2">
            {editingItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Category"
                    />
                    <div className="relative w-20">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full pl-5 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                        placeholder="0"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-1 focus:ring-red-300 text-xs"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.note || ''}
                    onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Note (optional)"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add New Item Button */}
          <button
            onClick={handleAddItem}
            className="w-full mt-3 px-3 py-2 border border-dashed border-gray-300 text-gray-600 rounded hover:border-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex gap-2 justify-end border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
