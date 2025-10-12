// src/router/index.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/Pages/Dashboard";
import LoginPage from "@/components/Login";
import NotFoundPage from "@/Pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅
import Brand from "./Pages/Brand/Brand";
import BrandAdd from "./Pages/Brand/BrandAdd";
import BrandEdit from "./Pages/Brand/BrandEdit";
import Category from "./Pages/Category/Category";
import CategoryAdd from "./Pages/Category/CategoryAdd";
import CategoryEdit from "./Pages/Category/CategoryEdit";
import Product from "./Pages/Product/Product";
import ProductAdd from "./Pages/Product/ProductAdd";
import ProductEdit from "./Pages/Product/ProductEdit";
import Attribute from "./Pages/Attribute/Attribute";
import AttributeAdd from "./Pages/Attribute/AttributeAdd";
import AttributeEdit from "./Pages/Attribute/AttributeEdit";
import Barcode from "./Pages/Barcode/Barcode";
import Admin from "./Pages/Admin/Admin";
import AdminAdd from "./Pages/Admin/AdminAdd";
import AdminEdit from "./Pages/Admin/AdminEdit";
import City from "./Pages/City/City";
import CityAdd from "./Pages/City/CityAdd";
import CityEdit from "./Pages/City/CityEdit";
export default function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ Main Pages محمية */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ Product (Nested Routes محمية) */}
      <Route path="product">
        <Route
          index
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ProductAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <ProductEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Brand (Nested Routes محمية) */}
      <Route path="brand">
        <Route
          index
          element={
            <ProtectedRoute>
              <Brand />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <BrandAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <BrandEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Category (Nested Routes محمية) */}
      <Route path="category">
        <Route
          index
          element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CategoryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CategoryEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Attribute (Nested Routes محمية) */}
      <Route path="attribute">
        <Route
          index
          element={
            <ProtectedRoute>
              <Attribute />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <AttributeAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <AttributeEdit />
            </ProtectedRoute>
          }
        />

      </Route>
      {/* ✅ Admin (Nested Routes محمية) */}
      <Route path="admin">
        <Route
          index
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <AdminAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <AdminEdit />
            </ProtectedRoute>
          }
        />

      </Route>
                  {/* ✅ City (Nested Routes محمية) */}
      <Route path="city">
        <Route
          index
          element={
            <ProtectedRoute>
              <City />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CityAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CityEdit/>
            </ProtectedRoute>
          }
        />

      </Route>
      <Route
        path="barcode"
        element={
          <ProtectedRoute>
            <Barcode />
          </ProtectedRoute>
        }
      />
      {/* ❌ 404 - Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
