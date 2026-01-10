import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "/api"
    : "http://localhost:3000/api");

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/get-all-products`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data produk"
      );
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/products/add-product`,
        productData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert(response.data.message);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal menambahkan produk";
      alert(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/products/update-product/${id}`,
        productData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert(response.data.message);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui produk";
      alert(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/products/delete-product/${productId}`);
      alert("Produk berhasil dihapus");
      return productId;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus produk";
      alert(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default productSlice.reducer;
