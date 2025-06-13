import { useTransition } from 'react';

import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindIsrcSongsResponse } from '@documenso/trpc/server/isrcsong-router/schema';
import { useDataTable } from '@documenso/ui/lib/use-data-table';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { DataTable } from '@documenso/ui/primitives/data-table-table';

import { useOptionalCurrentTeam } from '~/providers/team';

import { TableActionBar } from '../isrc/isrc-table-action-bar';
import { DataTableAdvancedToolbar } from './data-table-advanced-toolbar';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableFilterList } from './data-table-filter-list';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableSortList } from './data-table-sort-list';

interface DataTableProps<TData, TValue> {
  data?: TFindIsrcSongsResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
  onMultipleDelete: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
}

type DocumentsTableRow = TFindIsrcSongsResponse['data'][number];

export const IsrcTable = ({
  data,
  isLoading,
  isLoadingError,
  onAdd,
  onEdit,
  onDelete,
  isMultipleDelete = false,
  setIsMultipleDelete,
  onMultipleDelete,
}: DataTableProps<DocumentsTableRow, DocumentsTableRow>) => {
  const { _, i18n } = useLingui();

  const team = useOptionalCurrentTeam();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useUpdateSearchParams();

  const createColumns = (): ColumnDef<DocumentsTableRow>[] => {
    const columns: ColumnDef<DocumentsTableRow>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title={'ID'} />,
        enableColumnFilter: true,
        accessorKey: 'id',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={'Date'} />,
        enableColumnFilter: true,
        accessorKey: 'date',
        enableHiding: true,
      },
      {
        header: 'Artists',
        enableColumnFilter: true,
        accessorKey: 'isrcArtists',
        enableHiding: true,
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={'Track Name'} />,
        enableColumnFilter: true,
        accessorKey: 'trackName',
        enableHiding: true,
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={'ISRC'} />,
        enableColumnFilter: true,
        accessorKey: 'isrc',
        enableHiding: true,
      },
      {
        accessorKey: 'duration',
        header: ({ column }) => <DataTableColumnHeader column={column} title={'Duration'} />,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title={'Title'} />,
        enableColumnFilter: true,
      },
      {
        enableHiding: true,

        enableColumnFilter: true,
        accessorKey: 'license',
        header: ({ column }) => <DataTableColumnHeader column={column} title={'License'} />,
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

  const results = data ?? {
    data: [],
    perPage: 10,
    currentPage: 1,
    totalPages: 1,
  };

  const onPaginationChange = (page: number, perPage: number) => {
    startTransition(() => {
      updateSearchParams({
        page,
        perPage,
      });
    });
  };

  return (
    <div className="relative">
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
        actionBar={<TableActionBar table={table} />}
      >
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
    </div>
  );
};
