// src/components/ui/combobox-multi-select.jsx

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils"; // وظيفة utils الأساسية من Shadcn
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const ComboboxMultiSelect = ({
    options = [], // [{ label: 'Color', value: '1' }]
    selected = [], // ['1', '2'] - مصفوفة القيم المختارة
    onChange, // دالة لتحديث القيم المختارة (مثل handleVariationChange)
    placeholder = "Select options...",
    creatable = false, // للسماح بإنشاء خيارات جديدة
}) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleSelect = (value) => {
        const isSelected = selected.includes(value);
        let newSelection;

        if (isSelected) {
            // إزالة القيمة من المصفوفة
            newSelection = selected.filter((v) => v !== value);
        } else {
            // إضافة القيمة إلى المصفوفة
            newSelection = [...selected, value];
        }
        
        onChange(newSelection);
        setInputValue(""); // مسح حقل البحث
        // لا نغلق القائمة للسماح بالاختيار المتعدد
    };

    const handleCreate = (newOptionValue) => {
        // إذا كانت القيمة غير موجودة وتم تفعيل creatable
        if (creatable && newOptionValue.trim() !== "") {
            const value = newOptionValue.trim();
            // هنا يجب عليك تحديث قائمة الـ options في الـ state الأب أيضاً
            // لكن هنا نكتفي بإضافتها إلى قائمة الخيارات المختارة
            
            // تحقق من عدم وجودها بالفعل كخيار أو كقيمة مختارة
            const optionExists = options.some(opt => opt.value === value || opt.label === value);
            if (!optionExists && !selected.includes(value)) {
                 onChange([...selected, value]);
            }
        }
        setInputValue("");
    };

    const handleRemoveBadge = (value) => {
        const newSelection = selected.filter((v) => v !== value);
        onChange(newSelection);
    };

    const selectedOptions = selected.map(selectedValue => 
        options.find(opt => opt.value === selectedValue) || { label: selectedValue, value: selectedValue }
    );
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-10 p-2 border-dashed"
                >
                    {/* عرض الخيارات المختارة كـ Badges */}
                    <div className="flex flex-wrap gap-1 items-center min-h-6">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((option) => (
                                <Badge 
                                    key={option.value} 
                                    variant="secondary"
                                    className="text-xs pr-1"
                                    onClick={(e) => {
                                        e.stopPropagation(); // منع إغلاق الـ Popover
                                        handleRemoveBadge(option.value);
                                    }}
                                >
                                    {option.label}
                                    <X className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" />
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput 
                        placeholder="Search or add option..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                             {creatable && inputValue.length > 0 ? (
                                <CommandItem onSelect={() => handleCreate(inputValue)} className="text-blue-600">
                                    + Add new: "{inputValue}"
                                </CommandItem>
                            ) : (
                                "No results found."
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value)
                                                ? "opacity-100 text-primary"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

// 💡 يمكنك تصدير المكون بالاسم المطلوب في ملف ProductPriceTab
export { ComboboxMultiSelect };