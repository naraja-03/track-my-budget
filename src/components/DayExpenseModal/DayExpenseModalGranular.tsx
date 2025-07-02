import { useState, useEffect } from "react";
import { 
  useBulkUpdateExpensesMutation,
  useGranularUpdateExpensesMutation
} from "@/service/query/endpoints/ExpenseApi";

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
  useGranularOps?: boolean; // Flag to enable granular operations
}

type EditingItem = ExpenseItem & {
  originalIndex?: number; // Track original position for updates
  isNew?: boolean; // Track if this is a new item
  isModified?: boolean; // Track if this item has been modified
  isDeleted?: boolean; // Track if this item should be deleted
};

export default function DayExpenseModalGranular({ 
  dayExpense, 
  isOpen, 
  onClose, 
  useGranularOps = false 
}: Props) {
  const [editingItems, setEditingItems] = useState<EditingItem[]>([]);
  const [bulkUpdateExpenses] = useBulkUpdateExpensesMutation();
  const [granularUpdateExpenses] = useGranularUpdateExpensesMutation();

  // Initialize editing items when modal opens
  useEffect(() => {
    if (dayExpense) {
      const itemsWithIndex: EditingItem[] = dayExpense.items.map((item, index) => ({
        ...item,
        originalIndex: index,
        isNew: false,
        isModified: false,
        isDeleted: false
      }));
      setEditingItems(itemsWithIndex);
    }
  }, [dayExpense]);

  if (!isOpen || !dayExpense) return null;

  const handleItemChange = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const newItems = [...editingItems];
    const item = newItems[index];
    
    // Mark as modified if it's not a new item
    if (!item.isNew && item.originalIndex !== undefined) {
      item.isModified = true;
    }
    
    newItems[index] = { ...item, [field]: value };
    setEditingItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const item = editingItems[index];
    
    if (item.isNew) {
      // If it's a new item, just remove it from the array
      const newItems = editingItems.filter((_, i) => i !== index);
      setEditingItems(newItems);
    } else {
      // If it's an existing item, mark it for deletion
      const newItems = [...editingItems];
      newItems[index] = { ...item, isDeleted: true };
      setEditingItems(newItems);
    }
  };

  const handleAddItem = () => {
    setEditingItems([...editingItems, { 
      category: "", 
      amount: 0, 
      note: "",
      isNew: true,
      isModified: false,
      isDeleted: false
    }]);
  };

  const handleSaveGranular = async () => {
    try {
      console.log('Starting granular save process...');
      
      const operations: Array<{
        type: 'add' | 'update' | 'delete';
        index?: number;
        item?: ExpenseItem;
      }> = [];
      
      // Collect all operations
      editingItems.forEach((item) => {
        if (item.isDeleted && item.originalIndex !== undefined) {
          // Delete operation
          operations.push({
            type: 'delete',
            index: item.originalIndex
          });
        } else if (item.isModified && !item.isDeleted && !item.isNew && item.originalIndex !== undefined) {
          // Update operation
          if (item.category.trim() && item.amount > 0) {
            operations.push({
              type: 'update',
              index: item.originalIndex,
              item: {
                category: item.category,
                amount: item.amount,
                note: item.note || ""
              }
            });
          }
        } else if (item.isNew && !item.isDeleted) {
          // Add operation
          if (item.category.trim() && item.amount > 0) {
            operations.push({
              type: 'add',
              item: {
                category: item.category,
                amount: item.amount,
                note: item.note || ""
              }
            });
          }
        }
      });
      
      console.log(`Generated ${operations.length} operations:`, operations);
      
      // Send all operations in a single call
      const result = await granularUpdateExpenses({
        date: dayExpense.date,
        operations
      }).unwrap();
      
      console.log('Granular update completed successfully:', result);

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      onClose();
    } catch (error) {
      console.error('Failed to update expenses with granular operations:', error);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
  };

  const handleSaveBulk = async () => {
    try {
      console.log('Starting bulk save process...');
      
      // Filter out deleted and empty items
      const validItems = editingItems.filter(item => 
        !item.isDeleted &&
        item.category.trim() && 
        item.amount > 0
      );

      console.log('Valid items for bulk update:', validItems);

      const finalItems = validItems.map(item => ({
        category: item.category,
        amount: item.amount,
        note: item.note || ""
      }));

      await bulkUpdateExpenses({
        date: dayExpense.date,
        items: finalItems
      }).unwrap();

      console.log('Bulk update completed successfully');

      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      onClose();
    } catch (error) {
      console.error('Failed to update expenses with bulk operation:', error);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
  };

  const handleSave = () => {
    if (useGranularOps) {
      return handleSaveGranular();
    } else {
      return handleSaveBulk();
    }
  };

  const handleClose = () => {
    if (dayExpense) {
      const itemsWithIndex: EditingItem[] = dayExpense.items.map((item, index) => ({
        ...item,
        originalIndex: index,
        isNew: false,
        isModified: false,
        isDeleted: false
      }));
      setEditingItems(itemsWithIndex);
    }
    onClose();
  };

  // Filter out deleted items for display
  const displayItems = editingItems.filter(item => !item.isDeleted);
  const totalAmount = displayItems.reduce((sum, item) => sum + (item.amount || 0), 0);

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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Edit Expenses {useGranularOps && <span className="text-xs text-blue-600">(Granular)</span>}
            </h2>
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
            {displayItems.map((item, displayIndex) => {
              const actualIndex = editingItems.findIndex(editItem => editItem === item);
              return (
                <div key={actualIndex} className="group">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleItemChange(actualIndex, 'category', e.target.value)}
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
                            onChange={(e) => handleItemChange(actualIndex, 'amount', parseFloat(e.target.value) || 0)}
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
                        onChange={(e) => handleItemChange(actualIndex, 'note', e.target.value)}
                        className="w-full px-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                        placeholder="Optional note"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {item.isNew && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">New</span>}
                        {item.isModified && !item.isNew && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded ml-1">Modified</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(actualIndex)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {displayIndex < displayItems.length - 1 && <div className="mt-4 border-b border-gray-100"></div>}
                </div>
              );
            })}
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
