import React, { useState, useEffect } from "react";
import { X, Tag, Percent, User } from "lucide-react";

const VoucherModal = ({ isOpen, onClose, onSave, voucher }) => {
  const isEditMode = Boolean(voucher);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    maxUses: "",
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (isEditMode) {
        setFormData({
          code: voucher.code,
          discountPercentage: voucher.discountPercentage,
          maxUses: voucher.maxUses,
          isActive: voucher.isActive,
        });
      } else {
        setFormData({
          code: "",
          discountPercentage: "",
          maxUses: "",
          isActive: true,
        });
      }
    }
  }, [voucher, isOpen, isEditMode]);

  const handleSave = () => {
    setError("");
    if (
      !formData.code.trim() ||
      !formData.discountPercentage ||
      !formData.maxUses
    ) {
      setError("All column is required");
      return;
    }
    const discount = parseInt(formData.discountPercentage, 10);
    const max = parseInt(formData.maxUses, 10);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      setError("Discount must be in 0-100 Range");
      return;
    }
    if (isNaN(max) || max <= 0) {
      setError("Maximal Usage must be above 0");
      return;
    }
    onSave(formData); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {isEditMode ? "Edit Voucher" : "Add New Voucher"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Code
            </label>
            <div className="relative">
              <Tag
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage (%)
            </label>
            <div className="relative">
              <Percent
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Uses
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Voucher Active
            </label>
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="w-full border border-gray-300 py-3 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800"
            >
              Save Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
