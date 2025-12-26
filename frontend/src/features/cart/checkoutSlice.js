import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/api/checkouts";

// Async thunk for order cancellation
export const requestOrderCancellation = createAsyncThunk(
  "checkout/requestOrderCancellation",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.put(`${API_URL}/cancel/${orderId}`, { reason }, { headers });
      return response.data;
    } catch (err) {
      console.error("Cancellation error:", err.response || err);
      // Prefer sending the server message string if present, otherwise the full data or a message object
      const payload = err.response?.data?.message || err.response?.data || { message: err.message };
      return rejectWithValue(payload);
    }
  }
);

const initialState = {
  orders: [],
  loading: false,
  error: null,
  cancellationStatus: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestOrderCancellation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancellationStatus = null;
      })
      .addCase(requestOrderCancellation.fulfilled, (state, action) => {
        state.loading = false;
        state.cancellationStatus = "success";
        // Optionally update order status in state.orders
        const orderIndex = state.orders.findIndex(
          (o) => o._id === action.meta.arg.orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = "pembatalan diajukan";
          state.orders[orderIndex].cancellationReason = action.meta.arg.reason;
        }
      })
      .addCase(requestOrderCancellation.rejected, (state, action) => {
        state.loading = false;
        state.cancellationStatus = "failed";
        // action.payload may be a string message or an object { message }
        state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || "Failed to request cancellation";
      });
  },
});

export default checkoutSlice.reducer;
