import { useTransition } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindTuStreamsResponse } from '@documenso/trpc/server/tustreams-router/schema';
import { useDataTable } from '@documenso/ui/lib/use-data-table';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { DataTable } from '@documenso/ui/primitives/data-table-table';

import { useOptionalCurrentTeam } from '~/providers/team';

import { TableActionBar } from '../tustreams/tustreams-table-action-bar';
import { DataTableAdvancedToolbar } from './data-table-advanced-toolbar';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableFilterList } from './data-table-filter-list';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableSortList } from './data-table-sort-list';

interface DataTableProps<TData, TValue> {
  data?: TFindTuStreamsResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
  onMultipleDelete: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
}

type DocumentsTableRow = TFindTuStreamsResponse['data'][number];

export const TuStreamsTable = ({
  data,
  isLoading,
  isLoadingError,
  onAdd,
  onEdit,
  onDelete,
  onMultipleDelete,
  isMultipleDelete = false,
  setIsMultipleDelete,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Date`)} />,
        accessorKey: 'date',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) =>
          row.original.date ? format(row.original.date, 'd MMM yyyy', { locale: es }) : '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Title`)} />,
        accessorKey: 'title',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.title || '-',
      },
      {
        header: _(msg`Artists`),

        accessorKey: 'tuStreamsArtists',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.tuStreamsArtists || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Type`)} />,
        accessorKey: 'type',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.type || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`UPC`)} />,
        accessorKey: 'UPC',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.UPC || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`total`)} />,
        accessorKey: 'total',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.total || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`CreatedAt`)} />,
        accessorKey: 'createdAt',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) =>
          row.original.createdAt
            ? format(row.original.createdAt, 'd MMM yyyy', { locale: es })
            : '-',
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
    <div className="relative">
      <DataTable
        setIsMultipleDelete={setIsMultipleDelete}
        isMultipleDelete={isMultipleDelete}
        onDelete={onDelete}
        onEdit={onEdit}
        currentTeamMemberRole={team?.currentTeamMember?.role}
        data={results.data}
        onMultipleDelete={onMultipleDelete}
        perPage={results.perPage}
        currentPage={results.currentPage}
        totalPages={results.totalPages}
        from="tustreams"
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
        actionBar={
          <TableActionBar table={table} currentTeamMemberRole={team?.currentTeamMember?.role} />
        }
      >
        <DataTableAdvancedToolbar loading={isLoading || false} table={table}>
          <DataTableSortList table={table} align="start" loading={isLoading || false} />
          <DataTableFilterList
            loading={isLoading || false}
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
