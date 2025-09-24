import { Routes, Route, Navigate } from "react-router-dom";
// import Dashboard from "@/Pages/Dashboard";
import Payments from "@/Pages/Payments";
import Product from "@/Pages/Product/Product";
import ProductAdd from "@/Pages/Product/ProductAdd";
import ProductEdit from "./Pages/Product/ProductEdit";
import Category from "./Pages/Product/Category";
import Theme from "./Pages/Theme";
import LoginPage from "./components/Login";
import PosLayout from "./Pages/POS/PosLayout";
import NotFound from "./Pages/NotFound";
import Dashboard from "./Pages/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔐 Authentication Route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 🏠 Dashboard Route */}
      <Route path="/" element={<Dashboard />} />
      
      {/* 📦 Product Management Routes */}
      <Route path="/product" element={<Product />} />
      <Route path="/product/add" element={<ProductAdd />} />
      <Route path="/product/edit/:id" element={<ProductEdit />} />
      <Route path="/product/category" element={<Category />} />
      
      {/* 🛒 Point of Sale Route */}
      <Route path="/point-of-sale" element={<PosLayout />} />
      <Route path="/pos" element={<PosLayout />} /> {/* Alternative path */}
      
      {/* 💳 Payments Route */}
      <Route path="/payments" element={<Payments />} />
      
      {/* 🎨 Theme Route */}
      <Route path="/theme" element={<Theme />} />
      
      {/* 🔄 Root Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* ❌ 404 - Not Found Route (should be last) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}