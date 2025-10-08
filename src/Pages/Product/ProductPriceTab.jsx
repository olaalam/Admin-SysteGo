// src/pages/ProductPriceTab.jsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Upload, ChevronDown, RotateCw, Copy } from "lucide-react";
import useGet from "@/hooks/useGet";
import { toast } from "react-toastify";

const ProductPriceTab = ({
  form,
  handleChange,
  allVariations = [],
  selectedVariationIds = [],
  handleVariationChange,
  selectedOptionsMap = {},
  handleOptionsChange,
  handleVariantFieldChange,
}) => {
  const [showVariationDropdown, setShowVariationDropdown] =
    React.useState(false);

  // استخدام useGet لتوليد الكود
  const { data, refetch } = useGet("/api/admin/product/generate-code/", {
    manual: true,
  });

  // استخدام _id والمقارنات الصحيحة
  const uniqueVariations = React.useMemo(() => {
    const seenIds = new Set();
    // التأكد من أن كل عنصر لديه _id قبل الإضافة إلى المجموعة
    return allVariations.filter((variation) => {
      if (variation._id && !seenIds.has(variation._id)) {
        seenIds.add(variation._id);
        return true;
      }
      return false;
    });
  }, [allVariations]);

  const toggleVariation = (variationId) => {
    const isSelected = selectedVariationIds.includes(variationId);
    if (isSelected) {
      handleVariationChange(
        selectedVariationIds.filter((id) => id !== variationId)
      );
    } else {
      handleVariationChange([...selectedVariationIds, variationId]);
    }
  };

  const toggleOption = (variationId, optionName) => {
    const currentOptions = selectedOptionsMap[variationId] || [];
    const isSelected = currentOptions.includes(optionName);

    if (isSelected) {
      handleOptionsChange(
        variationId,
        currentOptions.filter((opt) => opt !== optionName)
      );
    } else {
      handleOptionsChange(variationId, [...currentOptions, optionName]);
    }
  };

  const handleVariantImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleVariantFieldChange(index, "image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const selectedVariations = allVariations.filter((v) =>
    selectedVariationIds.includes(v._id)
  );

  // دالة لتوليد كود المتغير (Variant Code)
  const generateVariantCode = async (index) => {
    try {
      await refetch(); // لإجراء طلب API والحصول على الكود الجديد
      if (!data?.code) {
        throw new Error("No code returned");
      }
      handleVariantFieldChange(index, "code", data.code);
      toast.success(`Generated code: ${data.code}`);
    } catch (err) {
      console.error("Error generating code:", err);
      toast.error("Failed to generate product code. Please try again.");
    }
  };

  const copyVariantCode = (code) => {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success(`Code copied: ${code}`);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy code.");
      });
  };

  return (
    <div className="space-y-6">
      {/* Unit Price (تم الإبقاء عليها لأنها سعر المنتج الأساسي) */}



      {/* low_stock and Quantity of the base product (if not variant) */}
      <div className="grid grid-cols-2 gap-4">
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
              handleChange("price", parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="h-11 pl-14"
            step="0.01"
            min="0"
          />
        </div>
      </div>
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            low_stock 
          </Label>
          <Input
            type="number"
            value={form.low_stock}
            onChange={(e) =>
              handleChange("low_stock", parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className="h-11"
            min="0"
          />
        </div>
      </div>

      {/* Different Prices Toggle */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Checkbox
          id="different-price"
          checked={form.different_price}
          onCheckedChange={(val) => handleChange("different_price", val)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label
            htmlFor="different-price"
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Enable Variable Pricing
          </Label>
          <p className="text-xs text-gray-600 mt-1">
            Allow different prices based on variations (Size, Color, etc.)
          </p>
        </div>
      </div>

      {/* Variations Section - Only show if different_price is enabled */}
      {form.different_price && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Variations
          </h3>

          {/* Variation Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Variations
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowVariationDropdown(!showVariationDropdown)
                  }
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:border-gray-400 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    {selectedVariationIds.length > 0
                      ? `${selectedVariationIds.length} variation(s) selected`
                      : "Choose variations..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {showVariationDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {uniqueVariations.map((variation) => (
                      <label
                        key={variation._id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedVariationIds.includes(variation._id)}
                          onCheckedChange={() => toggleVariation(variation._id)}
                        />
                        <span className="text-sm text-gray-700">
                          {variation.name}
                        </span>
                      </label>
                    ))}
                    {uniqueVariations.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No variations available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Variations Tags */}
            {selectedVariations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedVariations.map((variation) => (
                  <div
                    key={variation._id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm"
                  >
                    <span>{variation.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleVariation(variation._id)}
                      className="hover:bg-secondary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Options Selection - الآن تعرض Checkboxes مباشرة */}
            {selectedVariations.map((variation) => {
              return (
                <div
                  key={variation._id}
                  className="p-24 border border-gray-200 rounded-lg bg-white shadow-sm space-y-4"
                >
                  <h4 className="font-semibold text-gray-800">
                    {variation.name} Options
                  </h4>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select {variation.name} Options
                    </Label>
                    <div className="flex flex-wrap gap-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      {variation.options?.length > 0 ? (
                        variation.options.map((option) => (
                          <label
                            key={`${variation._id}-${option._id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={
                                selectedOptionsMap[variation._id]?.includes(
                                  option.name
                                ) || false
                              }
                              onCheckedChange={() =>
                                toggleOption(variation._id, option.name)
                              }
                            />
                            <span className="text-sm text-gray-700">
                              {option.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">
                          No options available for this variation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Options Tags */}
                  {selectedOptionsMap[variation._id]?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedOptionsMap[variation._id].map((option) => (
                        <div
                          key={`${variation._id}-${option}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          <span>{option}</span>
                          <button
                            type="button"
                            onClick={() => toggleOption(variation._id, option)}
                            className="hover:bg-gray-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Variants Table */}
          {form.prices.length > 0 && (
            <div className="mt-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Variant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Price (EGP)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Photo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {form.prices.map((variant, index) => (
                        <tr
                          key={
                            variant.id || variant.code || variant.name || index
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {variant.name}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={variant.price || 0}
                              onChange={(e) =>
                                handleVariantFieldChange(
                                  index,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-9 w-32"
                              step="0.01"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={variant.code || ""}
                                onChange={(e) =>
                                  handleVariantFieldChange(
                                    index,
                                    "code",
                                    e.target.value
                                  )
                                }
                                className="h-9 w-40"
                                placeholder="code"
                              />
                              {/* زر التوليد (Generate) */}
                              <button
                                type="button"
                                onClick={() => generateVariantCode(index)}
                                className="h-9 w-9 flex items-center justify-center text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Generate Code"
                              >
                                <RotateCw className="h-4 w-4" />
                              </button>
                              {/* زر النسخ (Copy) */}
                              <button
                                type="button"
                                onClick={() => copyVariantCode(variant.code)}
                                className="h-9 w-9 flex items-center justify-center text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Copy Code"
                                disabled={!variant.code}
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
<td className="px-4 py-3">
  <Input
    type="number"
    value={variant.quantity || 0}
    onChange={(e) =>
      handleVariantFieldChange(
        index,
        "quantity",
        parseInt(e.target.value) || 0
      )
    }
    className="h-9 w-24"
    min="0"
  />
</td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {variant.image ? (
                                <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden">
                                  <img
                                    src={variant.image}
                                    alt={variant.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVariantFieldChange(
                                        index,
                                        "image",
                                        ""
                                      )
                                    }
                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors">
                                    <Upload className="h-4 w-4 text-gray-600" />
                                    <span className="text-xs text-gray-700">
                                      Upload
                                    </span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleVariantImageUpload(index, e)
                                    }
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {form.prices.length} variant(s) generated
              </p>
            </div>
          )}

          {/* Message when no variants generated */}
          {form.prices.length === 0 && selectedVariationIds.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Select options for each variation to generate variants
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPriceTab;
