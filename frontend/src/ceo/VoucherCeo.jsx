import React, { useState } from "react";
import { Edit, Trash2, Plus, FileText } from "lucide-react";
import ConfirmationModalCeo from "./ConfirmationModalCeo";
import { useNavigate } from "react-router-dom";
import VoucherModalCeo from "./VoucherModalCeo";

function VoucherCeo({ vouchers, onAdd, onUpdate, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const navigate = useNavigate();

  const handleOpenModal = (voucher = null) => {
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
  };

  const handleOpenConfirm = (voucher) => {
    setVoucherToDelete(voucher);
    setIsConfirmOpen(true);
  };

  const handleDelete = () => {
    onDelete(voucherToDelete._id);
    setIsConfirmOpen(false);
    setVoucherToDelete(null);
  };

  const handleSaveVoucher = (voucherData) => {
    if (editingVoucher) {
      onUpdate(editingVoucher._id, voucherData);
    } else {
      onAdd(voucherData);
    }
  };

  // --- STYLE CONSTANTS ---
  const thClass =
    "px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200";
  const tdClass =
    "px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200";
  const btnPrimary =
    "flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto";
  const btnSecondary =
    "flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto";

  return (
    // WRAPPER UTAMA: Force Light Mode
    <div className="w-full min-h-screen bg-white text-gray-900 p-6 space-y-8 font-sans">
      {/* --- MODALS --- */}
      <VoucherModalCeo
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveVoucher}
        voucher={editingVoucher}
      />
      <ConfirmationModalCeo
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Voucher"
        message={`Are you sure you want to permanently delete the voucher "${voucherToDelete?.code}"? This action cannot be undone.`}
        confirmButtonText="Yes, Delete It"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />

      {/* --- MAIN CARD --- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Voucher Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage discounts and promo codes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/laporan-voucher-ceo")}
              className={btnSecondary}
            >
              <FileText size={18} />
              <span>Laporan Voucher</span>
            </button>

            <button onClick={() => handleOpenModal()} className={btnPrimary}>
              <Plus size={18} />
              <span>Add New Voucher</span>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thClass}>Code</th>
                <th className={thClass}>Discount</th>
                <th className={thClass}>Usage</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vouchers.length > 0 ? (
                vouchers.map((voucher) => {
                  const isActive =
                    voucher.isActive && voucher.currentUses < voucher.maxUses;
                  return (
                    <tr
                      key={voucher._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className={`${tdClass} font-mono font-bold text-blue-600`}
                      >
                        {voucher.code}
                      </td>
                      <td className={`${tdClass} font-semibold`}>
                        {voucher.discountPercentage}%
                      </td>
                      <td className={tdClass}>
                        <span className="font-medium">
                          {voucher.currentUses}
                        </span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span>{voucher.maxUses}</span>
                      </td>
                      <td className={tdClass}>
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            isActive
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(voucher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(voucher)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500 italic"
                  >
                    No active vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VoucherCeo;
