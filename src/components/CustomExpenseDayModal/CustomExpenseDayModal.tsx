import { useState, useEffect } from "react";
import { 
  useGranularUpdateCustomExpenseTransactionsMutation
} from "@/service/query/endpoints/ExpenseApi";

type ExpenseItem = {
  _id?: string; // Add transaction ID to track individual items
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
  customExpenseId: string;
}

export default function CustomExpenseDayModal({ dayExpense, isOpen, onClose, customExpenseId }: Props) {
  const [editingItems, setEditingItems] = useState<ExpenseItem[]>([]);
  const [originalItems, setOriginalItems] = useState<ExpenseItem[]>([]);
  const [granularUpdateTransactions] = useGranularUpdateCustomExpenseTransactionsMutation();

  // Initialize editing items when modal opens
  useEffect(() => {
    if (dayExpense) {
      console.log('Modal opened with dayExpense:', dayExpense);
      console.log('Items with IDs:', dayExpense.items.map(item => ({ 
        category: item.category, 
        amount: item.amount, 
        id: item._id 
      })));
      
      const items = [...dayExpense.items];
      setEditingItems(items);
      setOriginalItems(items); // Keep track of original state
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
      console.log('Starting granular save process...');
      console.log('Original items:', originalItems);
      console.log('Current editing items:', editingItems);

      // Filter out empty items from current editing
      const validEditingItems = editingItems.filter(item => 
        item.category.trim() && item.amount > 0
      );

      console.log('Valid editing items:', validEditingItems);

      // Collect all operations
      const operations: Array<{
        type: 'add' | 'update' | 'delete';
        id?: string;
        transaction?: {
          category: string;
          amount: number;
          note?: string;
          date: string;
        };
      }> = [];

      // 1. Handle deletions: items that exist in original but not in current valid items
      const itemsToDelete = originalItems.filter(originalItem => 
        originalItem._id && !validEditingItems.find(editItem => editItem._id === originalItem._id)
      );

      console.log('Items to delete:', itemsToDelete);
      itemsToDelete.forEach(item => {
        operations.push({
          type: 'delete',
          id: item._id!
        });
      });

      // 2. Handle updates: items that exist in both original and current, but have changes
      const itemsToUpdate = validEditingItems.filter(editItem => {
        if (!editItem._id) return false; // Skip new items
        const originalItem = originalItems.find(orig => orig._id === editItem._id);
        if (!originalItem) return false; // Skip if not found in original
        
        // Check if anything changed
        return (
          originalItem.category !== editItem.category ||
          originalItem.amount !== editItem.amount ||
          originalItem.note !== editItem.note
        );
      });

      console.log('Items to update:', itemsToUpdate);
      itemsToUpdate.forEach(item => {
        operations.push({
          type: 'update',
          id: item._id!,
          transaction: {
            category: item.category,
            amount: item.amount,
            note: item.note || "",
            date: dayExpense.date,
          }
        });
      });

      // 3. Handle additions: items that don't have _id (new items)
      const itemsToAdd = validEditingItems.filter(editItem => !editItem._id);

      console.log('Items to add:', itemsToAdd);
      itemsToAdd.forEach(item => {
        operations.push({
          type: 'add',
          transaction: {
            category: item.category,
            amount: item.amount,
            note: item.note || "",
            date: dayExpense.date,
          }
        });
      });

      console.log(`Generated ${operations.length} operations:`, operations);

      // Send all operations in a single call
      const result = await granularUpdateTransactions({
        customExpenseId,
        operations
      }).unwrap();

      console.log('Granular save completed successfully:', result);
      console.log(`Operations processed: ${result.processed.deleted} deleted, ${result.processed.updated} updated, ${result.processed.added} added`);

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      onClose();
    } catch (error) {
      console.error('Failed to update custom expense transactions:', error);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
  };

  const handleClose = () => {
    setEditingItems([...dayExpense.items]);
    setOriginalItems([...dayExpense.items]);
    onClose();
  };

  const totalAmount = editingItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md sm:h-auto max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: "15vh",
        }}
      >
        {/* Mobile drag indicator */}
        <div className="flex items-center justify-center pt-3 pb-2 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Edit Expenses</h2>
            <p className="text-sm text-gray-500">{dayExpense.date}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
            <p className="text-xl font-semibold text-gray-900">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 px-4 pb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 min-h-0">
          <div className="space-y-4">
            {editingItems.map((item, index) => (
              <div key={index} className="group">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        className="w-full px-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        placeholder="Enter category"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium">₹</span>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-2 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono transition-all hover:border-gray-300"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                    <input
                      type="text"
                      value={item.note || ''}
                      onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                      className="w-full px-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                      placeholder="Optional note"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {index < editingItems.length - 1 && <div className="mt-4 border-b border-gray-100"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Item Button */}
        <div className="px-4 py-3 flex-shrink-0">
          <button
            onClick={handleAddItem}
            className="w-full py-3 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
          >
            + Add Item
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 bg-gray-50 flex gap-3 flex-shrink-0 rounded-b-2xl sm:rounded-b-xl">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
