// src/pages/ProductGeneralTab.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";

const ProductGeneralTab = ({ form, handleChange, categories, brands ,  loading }) => {
   if (loading) {
            return <Loader/>;
        }
    console.log("Categories received:", categories); 
  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter product name"
          className="h-11"
        />
      </div>

      {/* Category & Brand Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Category <span className="text-red-500">*</span>
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            value={form.categoryId[0] || ""}
            onChange={(e) => handleChange("categoryId", [e.target.value])}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Brand
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            value={form.brandId}
            onChange={(e) => handleChange("brandId", e.target.value)}
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit & Min Purchase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Unit
          </Label>
          <Input
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            placeholder="e.g., piece, kg, liter"
            className="h-11"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Minimum Purchase
          </Label>
          <Input
            type="number"
            value={form.mini_purchase}
            onChange={(e) =>
              handleChange("mini_purchase", parseInt(e.target.value, 10))
            }
            min="1"
            className="h-11"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Description
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter product description"
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default ProductGeneralTab;