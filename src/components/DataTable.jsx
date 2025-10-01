import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DataTable({
  data = [],
  columns = [],
  title = "Data Table",
  onAdd = null,
  onEdit = null,
  onDelete = null,
  addPath = null,
  editPath = null,
  itemsPerPage = 10,
  searchable = true,
  filterable = true,
  addButtonText = "Add New",
  className = "",
  showActions = true, // ✅ prop جديدة
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);
  const navigate = useNavigate();

  // Get unique values for filterable columns
const getFilterOptions = (columnKey) => {
  const values = data
    .map((item) => {
      const value = item[columnKey];
      if (typeof value === "object" && value !== null) {
        return value.name; // 👈 ناخد الاسم بدل الـ object
      }
      return value;
    })
    .filter(Boolean);
  return [...new Set(values)];
};


  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
filtered = filtered.filter((item) => {
  const fieldValue = item[key];
  if (typeof fieldValue === "object" && fieldValue !== null) {
    return fieldValue.name === value;
  }
  return fieldValue === value;
});
      }
    });

    return filtered;
  }, [data, searchTerm, selectedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Handle filter change
  const handleFilterChange = (columnKey, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className=" mb-4">
          {onAdd && (
            <button
              onClick={() => {
                if (addPath) {
                  navigate(addPath);
                } else if (onAdd) {
                  onAdd();
                }
              }}
              className="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              {addButtonText}
            </button>
          )}
          <h2 className="text-2xl font-meduim pt-4 text-gray-800">{title}</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {searchable && (
            <div className="relative flex-1 min-w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          {/* Filter Dropdowns */}
          {filterable &&
            columns
              .filter((col) => col.filterable)
              .map((column) => (
                <select
                  key={column.key}
                  value={selectedFilters[column.key] || ""}
                  onChange={(e) =>
                    handleFilterChange(column.key, e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All {column.header}</option>
                  {getFilterOptions(column.key).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ))}

          {/* Items per page */}
          <select
            value={itemsPerPageState}
            onChange={(e) => {
              setItemsPerPageState(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Reset filters button */}
          {(searchTerm || Object.values(selectedFilters).some((v) => v)) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {showActions && (onEdit || onDelete) && ( // ✅ شرط جديد
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </td>
                  ))}
                  {showActions && (onEdit || onDelete) && ( // ✅ شرط جديد
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => {
                              if (editPath) {
                                const path =
                                  typeof editPath === "function"
                                    ? editPath(item)
                                    : editPath;
                                navigate(path);
                              } else if (onEdit) {
                                onEdit(item);
                              }
                            }}
                            className="text-primary hover:text-teal-700 p-1 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showActions && (onEdit || onDelete) ? 1 : 0)} // ✅ تعديل
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
              results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === pageNum
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}