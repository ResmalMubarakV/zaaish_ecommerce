import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import UserLayout from "./components/Layout/UserLayout";
import { Toaster } from "sonner";
import ScrollToTop from "./components/Common/ScrollToTop";

// Lazy load pages for dynamic code splitting
const Home = lazy(() => import("./Pages/Home"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const Profile = lazy(() => import("./Pages/Profile"));
const WishlistPage = lazy(() => import("./Pages/WishlistPage"));
const CollectionPage = lazy(() => import("./Pages/CollectionPage"));
const ProductDetails = lazy(() => import("./components/Products/ProductDetails"));
const Checkout = lazy(() => import("./components/Cart/Checkout"));
const OrderConfirmationPage = lazy(() => import("./Pages/OrderConfirmationPage"));
const OrderDetailsPage = lazy(() => import("./Pages/OrderDetailsPage"));
const MyOrdersPage = lazy(() => import("./Pages/MyOrdersPage"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout"));
const AdminHomePage = lazy(() => import("./Pages/AdminHomePage"));
const UserManagement = lazy(() => import("./components/Admin/UserManagement"));
const ProductManagement = lazy(() => import("./components/Admin/ProductManagement"));
const EditProductPage = lazy(() => import("./components/Admin/EditProductPage"));
const AddProductPage = lazy(() => import("./components/Admin/AddProductPage"));
const OrderManagement = lazy(() => import("./components/Admin/OrderManagement"));
const CouponManagement = lazy(() => import("./components/Admin/CouponManagement"));
const AdminLogin = lazy(() => import("./Pages/AdminLogin"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-stone-50/50 dark:bg-stone-950">
    <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-950 rounded-full animate-spin dark:border-stone-800 dark:border-t-stone-100"></div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* PUBLIC USER ROUTES */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="collections/:collection?" element={<CollectionPage />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation/:id?" element={<OrderConfirmationPage />} />
              <Route path="order/:id" element={<OrderDetailsPage />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
            </Route>

            {/* SEPARATE ADMIN LOGIN ROUTE */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ADMIN DASHBOARD ROUTES */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="products/new" element={<AddProductPage />} />
              <Route path="products/:id/edit" element={<EditProductPage />} />
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};


export default App;