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
  showActions = true,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);
  const navigate = useNavigate();

  const safeData = Array.isArray(data) ? data : [];

  const getFilterOptions = (columnKey) => {
    const values = safeData
      .map((item) => {
        const value = item[columnKey];
        if (typeof value === "object" && value !== null) {
          return value.name;
        }
        return value;
      })
      .filter(Boolean);
    return [...new Set(values)];
  };

  const filteredData = useMemo(() => {
    let filtered = [...safeData];

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

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
  }, [safeData, searchTerm, selectedFilters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleFilterChange = (columnKey, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className={className}>
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        {onAdd && (
          <button
            onClick={() => {
              if (addPath) navigate(addPath);
              else onAdd();
            }}
            className="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            {addButtonText}
          </button>
        )}
      </div>

      {/* Search and Filters Row */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {searchable && (
            <div className="relative flex-1 min-w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          )}

          {filterable &&
            columns
              .filter((col) => col.filterable)
              .map((column) => {
                const options = getFilterOptions(column.key);
                return (
                  <select
                    key={column.key}
                    value={selectedFilters[column.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(column.key, e.target.value)
                    }
                    disabled={options.length === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">All {column.header}</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                );
              })}

          <select
            value={itemsPerPageState}
            onChange={(e) => {
              setItemsPerPageState(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {(searchTerm || Object.values(selectedFilters).some((v) => v)) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
                {showActions && (onEdit || onDelete) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={item.id || item._id || index} className="hover:bg-gray-50 transition-colors">
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
                    {showActions && (onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
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
                              className="text-teal-600 hover:text-teal-800 p-2 hover:bg-teal-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
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
                    colSpan={
                      columns.length + (showActions && (onEdit || onDelete) ? 1 : 0)
                    }
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium text-lg">
                        No data available
                      </p>
                      {!searchTerm && 
                       !Object.values(selectedFilters).some((v) => v) && 
                       onAdd && (
                        <button
                          onClick={() => {
                            if (addPath) navigate(addPath);
                            else onAdd();
                          }}
                          className="mt-2 text-teal-600 hover:text-teal-700 font-medium text-sm hover:underline"
                        >
                          Add your first item
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
                <span className="font-medium">{filteredData.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}