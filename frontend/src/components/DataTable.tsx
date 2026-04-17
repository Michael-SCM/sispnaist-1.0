import React from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  actions?: Array<{
    label: string;
    onClick: (row: T) => void;
    variant?: 'primary' | 'danger' | 'secondary';
  }>;
}

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      columns,
      data,
      isLoading,
      emptyMessage = 'Nenhum registro encontrado',
      onRowClick,
      onSort,
      sortBy,
      sortOrder = 'asc',
      actions,
    },
    ref
  ) => {
    if (isLoading) {
      return (
        <div ref={ref} className="w-full p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-2">Carregando...</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div ref={ref} className="w-full p-8 text-center text-gray-500">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="w-full overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left font-semibold text-gray-800"
                  style={{ width: column.width }}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => onSort(String(column.key))}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      {column.header}
                      {sortBy === column.key && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-center font-semibold text-gray-800">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer ${
                  onRowClick ? 'hover:bg-blue-50' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3"
                    style={{ width: column.width }}
                  >
                    {column.render
                      ? column.render((row as any)[String(column.key)], row)
                      : (row as any)[String(column.key)]}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition ${
                            action.variant === 'danger'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : action.variant === 'secondary'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(totalPages, currentPage + 1)
  );

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      <div className="flex gap-1">
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className="px-2 py-2">...</span>}
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded text-sm transition ${
              currentPage === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 py-2">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próxima
      </button>

      <span className="text-sm text-gray-600 ml-4">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
};
