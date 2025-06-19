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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
        <div className="font-semibold text-lg mb-2">{title}</div>
        <div className="text-gray-500 mb-6">{description}</div>
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white font-medium"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}