import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  confirmButtonColor = "bg-black hover:bg-gray-800",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-8 transform transition-all">
        <div className="flex justify-center flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-black">{title}</h2>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>

        <div className="flex space-x-4 pt-8">
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`w-full text-white py-3 px-4 rounded-md font-medium transition-colors ${confirmButtonColor}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
