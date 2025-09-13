"use client";

import React, { useState, useEffect } from "react";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface SortableTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
  }[];
  defaultSort?: SortConfig;
}

export default function SortableTable({
  data,
  columns,
  defaultSort,
}: SortableTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultSort || null
  );

  // Update sortConfig when defaultSort changes
  useEffect(() => {
    if (defaultSort && (!sortConfig || sortConfig.key !== defaultSort.key)) {
      setSortConfig(defaultSort);
    }
  }, [defaultSort, sortConfig]);

  // Force re-render when sortConfig changes
  useEffect(() => {
    // Re-render when sortConfig changes
  }, [sortConfig]);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    setSortConfig((prevSort) => {
      if (prevSort?.key === key) {
        return {
          key,
          direction: prevSort.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortedData = () => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), "sv-SE");
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  };

  const sortedData = getSortedData();

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortConfig.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-2 text-left font-semibold ${
                  column.className || ""
                } ${
                  column.sortable
                    ? "cursor-pointer hover:bg-gray-100 select-none transition-colors duration-200"
                    : ""
                } ${
                  sortConfig?.key === column.key
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={`${sortConfig?.key || "default"}-${index}-${
                row.number || index
              }`}
              className="border-b hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-2 ${column.className || ""}`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
