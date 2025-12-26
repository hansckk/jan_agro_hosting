import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ✅ Fetch all vouchers
export const fetchVouchers = createAsyncThunk(
  "vouchers/get-all-vouchers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers/get-all-vouchers`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vouchers");
    }
  }
);

// ✅ Create new voucher
export const createVoucher = createAsyncThunk(
  "vouchers/add-voucher",
  async (voucherData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/vouchers/add-voucher`, voucherData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create voucher");
    }
  }
);

// ✅ Update existing voucher
export const updateVoucher = createAsyncThunk(
  "vouchers/update-voucher",
  async ({ id, voucherData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/vouchers/update-voucher/${id}`, voucherData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update voucher");
    }
  }
);

// ✅ Delete voucher
export const deleteVoucher = createAsyncThunk(
  "vouchers/delete-voucher",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/vouchers/delete-voucher/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete voucher");
    }
  }
);

const voucherSlice = createSlice({
  name: "vouchers",
  initialState: {
    vouchers: [],
    error: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET ALL
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.vouchers.push(action.payload);
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateVoucher.fulfilled, (state, action) => {
        const index = state.vouchers.findIndex(v => v._id === action.payload._id);
        if (index !== -1) state.vouchers[index] = action.payload;
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.vouchers = state.vouchers.filter(v => v._id !== action.payload);
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default voucherSlice.reducer;
