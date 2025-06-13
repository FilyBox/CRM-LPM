import { useTransition } from 'react';
import * as React from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindReleaseResponse } from '@documenso/trpc/server/releases-router/schema';
import { useDataTable } from '@documenso/ui/lib/use-data-table';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { DataTable } from '@documenso/ui/primitives/data-table-table';

import { useOptionalCurrentTeam } from '~/providers/team';

import { ReleasesTableActionBar } from '../releases/releases-table-action-bar';
import { DataTableAdvancedToolbar } from './data-table-advanced-toolbar';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableFilterList } from './data-table-filter-list';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableSortList } from './data-table-sort-list';

interface DataTableProps<TData, TValue> {
  data?: TFindReleaseResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onRetry?: (data: ReleaseTableRow) => void;

  onEdit?: (data: ReleaseTableRow) => void;
  onMultipleDelete: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
  onDelete?: (data: ReleaseTableRow) => void;
  onNavegate?: (data: ReleaseTableRow) => void;
  onMoveDocument?: (data: ReleaseTableRow) => void;
}

type ReleaseTableRow = TFindReleaseResponse['data'][number];

export const ReleasesTable = ({
  data,
  isLoading,
  isLoadingError,
  onAdd,
  onEdit,
  onDelete,
  onMultipleDelete,
  isMultipleDelete = false,
  setIsMultipleDelete,
}: DataTableProps<ReleaseTableRow, ReleaseTableRow>) => {
  const { _, i18n } = useLingui();

  const team = useOptionalCurrentTeam();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useUpdateSearchParams();

  const createColumns = (): ColumnDef<ReleaseTableRow>[] => {
    const columns: ColumnDef<ReleaseTableRow>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-0.5"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Created`)} />,
        accessorKey: 'createdAt',
        enableHiding: true,
        cell: ({ row }) =>
          row.original.createdAt
            ? format(row.original.createdAt, 'd MMM yyyy HH:mm', { locale: es })
            : '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Date`)} />,
        accessorKey: 'date',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) =>
          row.original.date ? format(row.original.date, 'd MMM yyyy', { locale: es }) : '-',
      },

      {
        accessorKey: 'releasesArtists',
        enableHiding: true,
        enableColumnFilter: false,
        cell: ({ row }) => row.original.releasesArtists || '-',
      },
    ];
    return columns;
  };

  const columns = createColumns();

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data: data?.data || [],
    columns,
    pageCount: data?.totalPages || 1,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    defaultColumn: {
      columns,
      enableColumnFilter: false,
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  const onPaginationChange = (page: number, perPage: number) => {
    startTransition(() => {
      updateSearchParams({
        page,
        perPage,
      });
    });
  };

  const results = data ?? {
    data: [],
    perPage: 10,
    currentPage: 1,
    totalPages: 1,
  };

  return (
    <>
      <DataTable
        setIsMultipleDelete={setIsMultipleDelete}
        isMultipleDelete={isMultipleDelete}
        onDelete={onDelete}
        onEdit={onEdit}
        data={results.data}
        onMultipleDelete={onMultipleDelete}
        perPage={results.perPage}
        currentPage={results.currentPage}
        totalPages={results.totalPages}
        onPaginationChange={onPaginationChange}
        columnVisibility={{
          sender: team !== undefined,
        }}
        error={{
          enable: isLoadingError || false,
        }}
        skeleton={{
          enable: isLoading || false,
          rows: 5,
          component: (
            <DataTableSkeleton
              columnCount={columns.length}
              cellWidths={['3rem', '3rem', '3rem', '3rem', '2rem', '2rem', '2rem']}
              shrinkZero
            />
          ),
        }}
        table={table}
        actionBar={<ReleasesTableActionBar table={table} />}
      >
        {/* actionBar={<ReleasesTableActionBar table={table as any} />} */}

        {/* <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar> */}

        <DataTableAdvancedToolbar table={table}>
          <DataTableSortList table={table} align="start" />
          <DataTableFilterList
            table={table}
            shallow={shallow}
            debounceMs={debounceMs}
            throttleMs={throttleMs}
            align="start"
          />
        </DataTableAdvancedToolbar>
      </DataTable>
      {/* <UpdateTaskSheet
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      /> */}
    </>
  );
};
