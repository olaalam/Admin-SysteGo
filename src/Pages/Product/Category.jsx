import React, { useState } from "react";
import DataTable from "@/components/DataTable";
import DeleteDialog from "@/components/DeleteForm";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Category = () => {
    const [data, setData] = useState([
        {
            id: 1,
            category: "Appliances",
            parentCategory: "N/A",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 2,
            category: "BackPack",
            parentCategory: "N/A",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 3,
            category: "Beverages",
            parentCategory: "Foods",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 4,
            category: "Breakfast",
            parentCategory: "Foods",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 5,
            category: "Candy & Chocolates",
            parentCategory: "N/A",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 6,
            category: "Cooking",
            parentCategory: "Foods",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 7,
            category: "Dairy & Egg",
            parentCategory: "N/A",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
        {
            id: 8,
            category: "Dishwashers",
            parentCategory: "Appliances",
            numberOfProduct: 0,
            stockQuantity: 0,
        },
    ]);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate();

    const columns = [
        { key: "category", header: "Category", filterable: true },
        { key: "parentCategory", header: "Parent Category", filterable: true },
        { key: "numberOfProduct", header: "Number of Product", filterable: false },
        { key: "stockQuantity", header: "Stock Quantity", filterable: false },
    ];

    const handleAdd = () => {
        // You can use navigate to go to a new page for adding a category
        navigate("/category/add");
        // Or you could open a modal/dialog here
    };

    const handleEdit = (item) => {
        // You can navigate to an edit page with the item's ID
        navigate(`/category/edit/${item.id}`);
        // Or you could open a modal/dialog for editing
    };

    const handleDelete = (item) => {
        setData((prevData) => prevData.filter((d) => d.id !== item.id));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={data}
                columns={columns}
                title="Category Management"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={(item) => setDeleteTarget(item)} // Open the delete dialog
                addButtonText="Add Category"
                itemsPerPage={10}
                searchable={true}
                filterable={true}
            />

            {/* Delete Dialog */}
            {deleteTarget && (
                <DeleteDialog
                    title="Delete Category"
                    message={`Are you sure you want to delete "${
                        deleteTarget.category || deleteTarget.id
                    }"?`}
                    onConfirm={() => {
                        handleDelete(deleteTarget); // Perform the actual deletion
                        setDeleteTarget(null); // Close the dialog
                    }}
                    onCancel={() => setDeleteTarget(null)} // Close the dialog without deleting
                />
            )}
        </div>
    );
};

export default Category;