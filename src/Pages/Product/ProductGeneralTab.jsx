// src/pages/ProductGeneralTab.jsx (Updated imports and component logic)
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";

// shadcn/ui imports needed for the Multi-Select Combobox
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

// ----------------------------------------------------------------------
// NEW Multi-Select Combobox Component
// ----------------------------------------------------------------------

const CategoryMultiSelect = ({ label, value, options, onChange, required = false }) => {
  const [open, setOpen] = React.useState(false);

  const selectedValues = new Set(value);

  const handleSelect = (optionId) => {
    // Check if the option is already selected
    if (selectedValues.has(optionId)) {
      // If selected, remove it
      selectedValues.delete(optionId);
    } else {
      // If not selected, add it
      selectedValues.add(optionId);
    }
    
    // Convert the Set back to an array and update the form state
    onChange(Array.from(selectedValues));
  };

  const handleRemove = (optionId) => {
    selectedValues.delete(optionId);
    onChange(Array.from(selectedValues));
  }

  // Find the selected category names for display
  const selectedNames = options
    .filter(option => selectedValues.has(option._id))
    .map(option => option.name);

  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            {selectedNames.length > 0 ? (
                <div className="flex flex-wrap gap-1 max-w-[90%]">
                    {/* Display selected items as Badges */}
                    {selectedNames.map((name, index) => (
                        <Badge key={index} variant="secondary" className="pl-2">
                            {name}
                            <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => {
                                e.stopPropagation(); // Prevent popover from closing
                                const selectedOption = options.find(opt => opt.name === name);
                                if (selectedOption) handleRemove(selectedOption._id);
                            }} />
                        </Badge>
                    ))}
                </div>
            ) : (
              "Select Category..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option._id}
                  value={option.name} // Use the name for search functionality
                  onSelect={() => {
                    handleSelect(option._id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.has(option._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ----------------------------------------------------------------------
// ProductGeneralTab Component (using the new Multi-Select)
// ----------------------------------------------------------------------

const ProductGeneralTab = ({ form, handleChange, categories, brands, loading }) => {
  if (loading) {
    return <Loader />;
  }
  console.log("Categories received:", categories);

  return (
    <div className="space-y-6">
      {/* Product Name (Unchanged) */}
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
        
        {/* Category Multi-Select Combobox (New Implementation) */}
        <CategoryMultiSelect
            label="Category"
            value={form.categoryId || []} // form.categoryId must be an array of IDs: ['id1', 'id2']
            options={categories}
            onChange={(newIds) => handleChange("categoryId", newIds)}
            required={true}
        />

        {/* Brand Single Select (Unchanged) */}
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

      {/* Unit & Min Purchase (Unchanged) */}
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
            Minimum Quantity
          </Label>
          <Input
            type="number"
            value={form.minimum_quantity_sale}
            onChange={(e) =>
              handleChange("minimum_quantity_sale", parseInt(e.target.value, 10))
            }
            min="1"
            className="h-11"
          />
        </div>
      </div>

      {/* Description (Unchanged) */}
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
      {/* ✅ Checkbox: المنتج له صلاحية */}
<div className="flex items-center space-x-2 mt-4">
  <input
    type="checkbox"
    checked={form.exp_ability}
    onChange={(e) => handleChange("exp_ability", e.target.checked)}
  />
  <label className="text-sm text-gray-700">Has Expiry Date</label>
</div>

{/* ✅ يظهر فقط لو exp_ability = true */}
{form.exp_ability && (
  <div className="mt-3">
    <label className="block text-sm font-medium text-gray-700">
      Expiry Date
    </label>
    <input
      type="date"
      value={form.date_of_expiery}
      onChange={(e) => handleChange("date_of_expiery", e.target.value)}
      className="mt-1 block w-full border rounded-md p-2"
    />
  </div>
)}

{/* ✅ حقول السعر بالجملة والكمية الابتدائية */}
<div className="grid grid-cols-2 gap-4 mt-4">
    <div>
    <label className="block text-sm font-medium text-gray-700">
      Start Quantity
    </label>
    <input
      type="number"
      value={form.start_quantaty}
      onChange={(e) => handleChange("start_quantaty", parseInt(e.target.value) || 0)}
      className="mt-1 block w-full border rounded-md p-2"
      placeholder="Enter start quantity"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Whole Price
    </label>
    <input
      type="number"
      value={form.whole_price}
      onChange={(e) => handleChange("whole_price", parseFloat(e.target.value) || 0)}
      className="mt-1 block w-full border rounded-md p-2"
      placeholder="Enter whole price"
    />
  </div>

</div>

{/* ✅ Checkbox لوجود IMEI */}
<div className="flex items-center space-x-2 mt-4">
  <input
    type="checkbox"
    checked={form.product_has_imei}
    onChange={(e) => handleChange("product_has_imei", e.target.checked)}
  />
  <label className="text-sm text-gray-700">Product has IMEI</label>
</div>

{/* ✅ Checkbox لعرض الكمية */}
<div className="flex items-center space-x-2 mt-4">
  <input
    type="checkbox"
    checked={form.show_quantity}
    onChange={(e) => handleChange("show_quantity", e.target.checked)}
  />
  <label className="text-sm text-gray-700">Show Quantity</label>
</div>

{/* ✅ يظهر فقط لو show_quantity = true */}
{form.show_quantity && (
  <div className="mt-3">
    <label className="block text-sm font-medium text-gray-700">
      Maximum to Show
    </label>
    <input
      type="number"
      value={form.maximum_to_show}
      onChange={(e) => handleChange("maximum_to_show", parseInt(e.target.value) || 0)}
      className="mt-1 block w-full border rounded-md p-2"
      placeholder="Enter maximum to show"
    />
  </div>
)}

    </div>
  );
};

export default ProductGeneralTab;