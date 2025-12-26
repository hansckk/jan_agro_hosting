import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import VoucherModal from "./VoucherModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../features/voucher/voucherSlice";

function Voucher() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const { vouchers, loading, error } = useSelector((state) => state.vouchers);

  useEffect(() => {
    dispatch(fetchVouchers());
  }, [dispatch]);

  // success message auto-clear
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

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
    if (voucherToDelete) {
      dispatch(deleteVoucher(voucherToDelete._id))
        .unwrap()
        .then(() => showSuccess("Voucher deleted successfully!"))
        .catch(() => {});
    }
    setIsConfirmOpen(false);
    setVoucherToDelete(null);
  };

  const handleSaveVoucher = (voucherData) => {
    if (editingVoucher) {
      dispatch(updateVoucher({ id: editingVoucher._id, voucherData }))
        .unwrap()
        .then(() => showSuccess("Voucher updated successfully!"))
        .catch(() => {});
    } else {
      dispatch(createVoucher(voucherData))
        .unwrap()
        .then(() => showSuccess("Voucher created successfully!"))
        .catch(() => {});
    }
    handleCloseModal();
  };

  return (
    <>
      <VoucherModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveVoucher}
        voucher={editingVoucher}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Voucher"
        message={`Are you sure you want to delete the voucher "${voucherToDelete?.code}"?`}
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Voucher Management</h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-black text-white py-2 px-4 rounded-md font-medium hover:bg-gray-800"
          >
            <Plus size={16} />
            <span>Add Voucher</span>
          </button>
        </div>

        {/* ✅ Success Message */}
        {successMessage && (
          <span className="text-green-600 text-sm font-medium transition-opacity duration-300">
            {successMessage}
          </span>
        )}

        {loading && <p className="text-gray-500 text-sm mb-3">Loading vouchers...</p>}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="overflow-x-auto border border-gray-200 rounded-lg mt-3">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-black">
                      {voucher.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {voucher.discountPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {voucher.currentUses} / {voucher.maxUses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          voucher.isActive && voucher.currentUses < voucher.maxUses
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {voucher.isActive && voucher.currentUses < voucher.maxUses
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(voucher)}
                        className="p-2 text-gray-500 hover:text-black"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenConfirm(voucher)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    No vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Voucher;
