import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ==========================================
// THUNKS: DATA FETCHING (GET)
// ==========================================

// 1. Fetch Users (Manajemen User)
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/get-all-users`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pengguna"
      );
    }
  }
);

// 2. Fetch Checkouts (Operasional Harian)
export const fetchCheckouts = createAsyncThunk(
  "admin/fetchCheckouts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/checkouts/all`, { headers });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 3. Fetch CEO Report (Laporan Pesanan/Keuangan Bulanan/Tahunan)
export const fetchCeoReport = createAsyncThunk(
  "admin/fetchCeoReport",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/checkouts/ceo-report`, {
        headers,
        params: { year, month },
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4. Fetch User Report (Laporan User Baru Harian/Bulanan/Tahunan)
export const fetchUserReport = createAsyncThunk(
  "admin/fetchUserReport",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/users/user-report`, {
        headers,
        params,
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 5. Fetch Loyal Users Report (Laporan User Setia)
export const fetchLoyalUsersReport = createAsyncThunk(
  "admin/fetchLoyalUsersReport",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/checkouts/loyal-users-report`,
        { headers }
      );

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 6. Fetch Best Selling Report (Laporan Barang Terlaku)
export const fetchBestSellingReport = createAsyncThunk(
  "admin/fetchBestSellingReport",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/checkouts/best-selling-report`,
        {
          headers,
          params,
        }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 7. Fetch All Reviews (Laporan Ulasan)
export const fetchAllReviews = createAsyncThunk(
  "admin/fetchAllReviews",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/reviews/all`, { headers });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 8. Fetch Voucher Usage Report (Laporan Penggunaan Voucher)
export const fetchVoucherUsageReport = createAsyncThunk(
  "admin/fetchVoucherUsageReport",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/vouchers/usage-report`, {
        headers,
        params,
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 9. Fetch Stock Movement Report (Laporan Gerakan Stok)
export const fetchStockMovementReport = createAsyncThunk(
  "admin/fetchStockMovementReport",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/admin/stock-movement-report`,
        {
          headers,
          params,
        }
      );

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 10. Fetch Stock Movement Summary Report
export const fetchStockMovementSummary = createAsyncThunk(
  "admin/fetchStockMovementSummary",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/admin/stock-movement-summary`,
        {
          headers,
          params,
        }
      );

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 11. Fetch Stock Report (Laporan Stok)
export const fetchStockReport = createAsyncThunk(
  "admin/fetchStockReport",
  async ({ filterType = "all" }, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/products/stock-report`, {
        params: { filterType },
        headers,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 12. Fetch Low Stock Report (Laporan Stok Menipis/Habis)
export const fetchLowStockReport = createAsyncThunk(
  "admin/fetchLowStockReport",
  async ({ filterType = "all" }, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/products/low-stock-report`, {
        params: { filterType },
        headers,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 13. Fetch Out of Stock Report (Laporan Stok Habis)
export const fetchOutOfStockReport = createAsyncThunk(
  "admin/fetchOutOfStockReport",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${API_URL}/products/out-of-stock-report`,
        {
          headers,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 14. Fetch Dashboard Stats (shared for CEO/Admin)
export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${API_URL}/auth/pemilik/dashboard-stats`,
        { headers }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ==========================================
// THUNKS: ACTIONS (PUT/DELETE/POST)
// ==========================================

export const editUser = createAsyncThunk(
  "admin/editUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/update-user/${id}`,
        userData
      );
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui pengguna";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/admin/delete-user/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus pengguna"
      );
    }
  }
);

export const toggleBanUser = createAsyncThunk(
  "admin/toggleBanUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/admin/toggle-ban/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengubah status ban"
      );
    }
  }
);

export const updateCheckoutStatus = createAsyncThunk(
  "admin/updateCheckoutStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.put(
        `${API_URL}/checkouts/${id}/status`,
        { status },
        { headers }
      );
      return response.data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui status pesanan";
      return rejectWithValue(msg);
    }
  }
);

export const decideCancellation = createAsyncThunk(
  "admin/decideCancellation",
  async ({ orderId, decision }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_URL}/checkouts/cancel/decision/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);

      return {
        orderId,
        decision,
        deleted: data.deleted,
        order: data.order,
        message: data.message,
      };
    } catch (err) {
      return rejectWithValue({ message: err.message });
    }
  }
);

// ==========================================
// SLICE DEFINITION
// ==========================================

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    dashboardStats: null,
    users: [], // Manajemen User
    checkouts: [], // Operasional Pesanan
    ceoReportData: [], // Laporan Pesanan
    userReportData: [], // Laporan User Baru
    loyalUsersData: [], // Laporan User Setia
    bestSellingData: [], // Laporan Barang Terlaku
    reviews: [], // Laporan Ulasan
    voucherReportData: [], // Laporan Voucher
    stockMovementData: [], // Laporan Gerakan Stok
    stockMovementSummary: [], // Ringkasan Gerakan Stok
    stockReportData: [], // Laporan Stok
    lowStockReportData: [], // Laporan Stok Menipis/Habis
    outOfStockReportData: [], // Laporan Stok Habis
    loading: false,
    error: null,
  },
  reducers: {
    setCheckouts(state, action) {
      state.checkouts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Users ---
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Checkouts ---
      .addCase(fetchCheckouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckouts.fulfilled, (state, action) => {
        state.loading = false;
        state.checkouts = action.payload;
      })
      .addCase(fetchCheckouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch CEO Report ---
      .addCase(fetchCeoReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCeoReport.fulfilled, (state, action) => {
        state.loading = false;
        state.ceoReportData = action.payload;
      })
      .addCase(fetchCeoReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch User Report ---
      .addCase(fetchUserReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReport.fulfilled, (state, action) => {
        state.loading = false;
        state.userReportData = action.payload;
      })
      .addCase(fetchUserReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Loyal Users Report ---
      .addCase(fetchLoyalUsersReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoyalUsersReport.fulfilled, (state, action) => {
        state.loading = false;
        state.loyalUsersData = action.payload;
      })
      .addCase(fetchLoyalUsersReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Best Selling Report ---
      .addCase(fetchBestSellingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBestSellingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.bestSellingData = action.payload;
      })
      .addCase(fetchBestSellingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch All Reviews ---
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Voucher Usage Report ---
      .addCase(fetchVoucherUsageReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVoucherUsageReport.fulfilled, (state, action) => {
        state.loading = false;
        state.voucherReportData = action.payload;
      })
      .addCase(fetchVoucherUsageReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Stock Movement Report ---
      .addCase(fetchStockMovementReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockMovementReport.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovementData = action.payload;
      })
      .addCase(fetchStockMovementReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Stock Movement Summary ---
      .addCase(fetchStockMovementSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockMovementSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovementSummary = action.payload;
      })
      .addCase(fetchStockMovementSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Stock Report ---
      .addCase(fetchStockReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockReport.fulfilled, (state, action) => {
        state.loading = false;
        state.stockReportData = action.payload;
      })
      .addCase(fetchStockReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Low Stock Report ---
      .addCase(fetchLowStockReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockReport.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockReportData = action.payload;
      })
      .addCase(fetchLowStockReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Out of Stock Report ---
      .addCase(fetchOutOfStockReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutOfStockReport.fulfilled, (state, action) => {
        state.loading = false;
        state.outOfStockReportData = action.payload;
      })
      // --- Fetch Dashboard Stats ---
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOutOfStockReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Actions: Edit User ---
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) state.users[index] = action.payload;
      })
      // --- Actions: Delete User ---
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      // --- Actions: Ban User ---
      .addCase(toggleBanUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) state.users[index] = action.payload;
      })
      // --- Actions: Update Checkout ---
      .addCase(updateCheckoutStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCheckoutStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated) return;
        const idx = state.checkouts.findIndex((c) => c._id === updated._id);
        if (idx !== -1)
          state.checkouts[idx] = { ...state.checkouts[idx], ...updated };
        else state.checkouts.unshift(updated);
      })
      .addCase(updateCheckoutStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })
      // --- Actions: Cancellation ---
      .addCase(decideCancellation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(decideCancellation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.deleted) {
          state.checkouts = state.checkouts.filter(
            (o) => o._id !== action.payload.orderId
          );
        } else {
          state.checkouts = state.checkouts.map((o) =>
            o._id === action.payload.orderId ? action.payload.order : o
          );
        }
      })
      .addCase(decideCancellation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to process cancellation";
      });
  },
});

export const { setCheckouts } = adminSlice.actions;
export default adminSlice.reducer;
