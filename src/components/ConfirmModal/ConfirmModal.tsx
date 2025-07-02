// ConfirmModal.tsx
import React from "react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-md p-0 sm:p-4">
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:w-80 h-auto sm:h-auto text-center animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        style={{
          marginTop: "15vh",
        }}
      >
        {/* Mobile drag indicator */}
        <div className="flex items-center justify-center pt-3 pb-2 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="px-4 py-4 sm:p-6">
          <div className="font-semibold text-lg sm:text-lg mb-2 sm:mb-2">{title}</div>
          <div className="text-gray-500 text-base sm:text-sm mb-6 sm:mb-6">{description}</div>
          <div className="flex gap-3 sm:gap-3 justify-center">
            <button
              className="flex-1 sm:flex-initial px-4 py-3 sm:px-4 sm:py-2 rounded-lg sm:rounded bg-gray-100 text-gray-700 font-medium text-base sm:text-base"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="flex-1 sm:flex-initial px-4 py-3 sm:px-4 sm:py-2 rounded-lg sm:rounded bg-red-500 text-white font-medium text-base sm:text-base"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}