import { useRef, useState } from 'react';

import { Plural, Trans } from '@lingui/react/macro';
import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { match } from 'ts-pattern';

import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;

  /**
   * The type of information to show on the left hand side of the pagination.
   *
   * Defaults to 'VisibleCount'.
   */
  additionalInformation?: 'SelectedCount' | 'VisibleCount' | 'None';
}

export function DataTablePagination<TData>({
  table,
  additionalInformation = 'VisibleCount',
}: DataTablePaginationProps<TData>) {
  const [pageInputValue, setPageInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      setPageInputValue(value);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInputValue, 10);
      if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= table.getPageCount()) {
        table.setPageIndex(pageNumber - 1);
        inputRef.current?.blur();
      } else {
        // Resetear a un valor válido si se ingresa un valor inválido
        setPageInputValue('');
      }
    }
  };

  const handlePageInputBlur = () => {
    // Resetear el valor cuando se pierde el foco
    setPageInputValue('');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-4 px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        {match(additionalInformation)
          .with('SelectedCount', () => (
            <span>
              <Trans>
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </Trans>
            </span>
          ))
          .with('VisibleCount', () => {
            const visibleRows = table.getFilteredRowModel().rows.length;

            return (
              <span data-testid="data-table-count">
                <Plural
                  value={visibleRows}
                  one={`Showing # result.`}
                  other={`Showing # results.`}
                />
              </span>
            );
          })
          .with('None', () => null)
          .exhaustive()}
      </div>

      <div className="flex items-center gap-x-2">
        <p className="whitespace-nowrap text-sm font-medium">
          <Trans>Rows per page</Trans>
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:gap-x-8">
        <div className="flex items-center gap-x-2 text-sm font-medium md:justify-center">
          <Trans>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </Trans>
          <div className="flex items-center">
            <Input
              ref={inputRef}
              className="h-8 w-16 text-center"
              placeholder="Ir a"
              type="number"
              min={1}
              max={table.getPageCount()}
              value={pageInputValue}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
              aria-label="Ir a la página"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
