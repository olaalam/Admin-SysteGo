// src/pages/productAdd.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/api/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ProductAdd = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState("general");

  const [form, setForm] = useState({
    name: "",
    categoryId: [],
    brandId: "",
    unit: "piece",
    description: "",
    mini_purchase: 1,
    image: "",
    gallery: [],
    price: 0,
    different_price: false,
    prices: [],
    discount: 0,
  });

  // fetch categories & brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          api.get("/api/admin/category"),
          api.get("/api/admin/brand"),
        ]);
        setCategories(catsRes.data?.categories || []);
        setBrands(brandsRes.data?.brands || []);
      } catch (err) {
        toast.error("Failed to load categories/brands", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e, multiple = false) => {
    const files = e.target.files;
    if (!files.length) return;
    [...files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (multiple) {
          setForm((prev) => ({
            ...prev,
            gallery: [...prev.gallery, reader.result],
          }));
        } else {
          setForm((prev) => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post("/api/admin/product", form);
      toast.success("Product added successfully!");
      navigate("/products");
    } catch (err) {
      console.error("❌ Error:", err.response?.data);
      const errorMessage =
        err.response?.data?.message || "Failed to add product";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/products")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          </div>
          <p className="text-gray-600 ml-9">Fill in the product details below</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 bg-gray-50">
              <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                <div className="flex w-full">
                  <TabsTrigger
                    value="general"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    General Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Media
                  </TabsTrigger>
                  <TabsTrigger
                    value="price"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pricing
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            {/* General Tab */}
            <TabsContent value="general" className="p-6 mt-0">
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
                      onChange={(e) =>
                        handleChange("categoryId", [e.target.value])
                      }
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
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="p-6 mt-0">
              <div className="space-y-6">
                {/* Main Image */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Main Product Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                      {form.image ? (
                        <div className="relative w-full h-full">
                          <img
                            src={form.image}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleChange("image", "");
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Product Gallery
                  </Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center py-4">
                        <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          Add more images
                        </p>
                      </div>
                      <Input
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </label>
                  </div>

                  {/* Gallery Preview */}
                  {form.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {form.gallery.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`gallery-${idx}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Price Tab */}
            <TabsContent value="price" className="p-6 mt-0">
              <div className="space-y-6">
                {/* Unit Price */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Unit Price (EGP) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      EGP
                    </span>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        handleChange("price", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                      className="h-11 pl-14"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Discount (%)
                  </Label>
                  <Input
                    type="number"
                    value={form.discount}
                    onChange={(e) =>
                      handleChange("discount", parseFloat(e.target.value))
                    }
                    placeholder="0"
                    className="h-11"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Different Prices Toggle */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="different-price"
                    checked={form.different_price}
                    onCheckedChange={(val) =>
                      handleChange("different_price", val)
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="different-price" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Enable Variable Pricing
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Allow different prices based on quantity or customer type
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 bg-secondary hover:bg-secondary/90"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;