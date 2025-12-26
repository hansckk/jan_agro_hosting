// English labels and helpers for statuses and reports
const statusLabels = {
  pending: "Pending",
  diproses: "Processed",
  "pembatalan diajukan": "Cancellation Submitted",
  dikirim: "Sent",
  sampai: "Arrived",
  selesai: "Completed",
  dibatalkan: "Cancelled",
  "pengembalian": "Return Submitted",
  "pengembalian berhasil": "Return Accepted",
  "pengembalian ditolak": "Return Rejected",
};

const reportTitles = {
  laporan_pesanan: "Order Report",
  laporan_user_baru: "New Users Report",
  laporan_barang_terlaku: "Best Selling Products",
  laporan_stok: "Stock Report",
  laporan_movement: "Stock Movement Report",
  laporan_user_setia: "Loyal Users Report",
  laporan_voucher: "Voucher Usage Report",
  laporan_revenue: "Revenue Report",
  laporan_metode_pembayaran: "Payment Methods Report",
};

export function getStatusLabel(status) {
  if (!status) return "-";
  return statusLabels[status] || status;
}

export { statusLabels, reportTitles };
