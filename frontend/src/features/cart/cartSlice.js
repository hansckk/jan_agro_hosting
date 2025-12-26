// src/features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ✅ Fetch user cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().users?.token;
      if (!token) return rejectWithValue("User not logged in.");

      const res = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Some APIs return data.data.items, some return data.data directly
      return res.data.data?.items || res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gagal memuat keranjang");
    }
  }
);

// ✅ Update quantity
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    try {
      const token = getState().users?.token;
      const res = await axios.put(
        `${API_URL}/cart/update-quantity`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.data?.items || res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gagal memperbarui kuantitas.");
    }
  }
);

// ✅ Remove item
export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const token = getState().users?.token;
      const res = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data?.items || res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gagal menghapus item.");
    }
  }
);

// ✅ Clear cart (used for logout)
export const clearCart = createAsyncThunk("cart/clearCart", async () => {
  return [];
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- Fetch Cart ----
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---- Update Quantity ----
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---- Clear Cart ----
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.error = null;
        state.loading = false;
      });
  },
});

export default cartSlice.reducer;
