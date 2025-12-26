import React, { useState, useEffect } from "react";
import { X, Tag, Percent, User } from "lucide-react";

const VoucherModalCeo = ({ isOpen, onClose, onSave, voucher }) => {
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
      setError("All field is required to fill.");
      return;
    }
    const discount = parseInt(formData.discountPercentage, 10);
    const max = parseInt(formData.maxUses, 10);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      setError("Discount must be in between 1-100.");
      return;
    }
    if (isNaN(max) || max <= 0) {
      setError("Maximum usage must be more than 0.");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-8 border-2 border-black">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-black">
          <h2 className="text-2xl font-bold text-black">
            {isEditMode ? "Edit Voucher" : "Add New Voucher"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <X size={24} className="text-black" />
          </button>
        </div>
        <div className="space-y-5">
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md border-2 border-red-800 text-sm font-semibold">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Voucher Code
            </label>
            <div className="relative">
              <Tag
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="e.g. HEMAT10"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-md focus:ring-2 focus:ring-black font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Discount Percentage (%)
            </label>
            <div className="relative">
              <Percent
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="number"
                placeholder="1 - 100"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: e.target.value,
                  })
                }
                className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Maximum Uses
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="number"
                placeholder="e.g. 100"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-md focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isActiveCEO"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-5 w-5 accent-black border-black text-black"
            />
            <label htmlFor="isActiveCEO" className="ml-3 block text-md font-medium text-black">
              Voucher Active
            </label>
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="w-full border-2 border-black bg-white text-black py-3 rounded-md font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 transition-colors"
            >
              Save Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherModalCeo;