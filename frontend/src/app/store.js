import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/products/productSlice";
import userReducer from "../features/user/userSlice";
import adminReducer from "../features/admin/adminSlice";
import voucherReducer from "../features/voucher/voucherSlice";
import cartReducer from "../features/cart/cartSlice";
import checkoutReducer from "../features/cart/checkoutSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    users: userReducer,
    admin: adminReducer,
    vouchers: voucherReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
  },
});