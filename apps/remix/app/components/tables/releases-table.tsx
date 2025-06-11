import { useTransition } from 'react';
import * as React from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { CheckIcon, XIcon } from 'lucide-react';
import { Link } from 'react-router';

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
        // header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Artists`)} />,
        accessorKey: 'releasesArtists',
        enableHiding: true,
        enableColumnFilter: false,
        cell: ({ row }) => row.original.releasesArtists || '-',
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={_(msg`Lanzamiento`)} />
        ),
        accessorKey: 'lanzamiento',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.lanzamiento || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Type`)} />,
        accessorKey: 'typeOfRelease',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.typeOfRelease || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Release`)} />,
        accessorKey: 'release',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.release || '-',
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Uploaded`)} />,
        accessorKey: 'uploaded',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.uploaded || '-',
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={_(msg`Streaming Link`)} />
        ),
        accessorKey: 'streamingLink',
        enableHiding: true,
        cell: ({ row }) =>
          row.original.streamingLink ? (
            <Link
              to={row.original.streamingLink}
              className="text-primary hover:underline"
              target="_blank"
            >
              Link
            </Link>
          ) : (
            '-'
          ),
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Assets`)} />,
        accessorKey: 'assets',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.assets === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.assets === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Canvas`)} />,
        accessorKey: 'canvas',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.canvas === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.canvas === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Cover`)} />,
        accessorKey: 'cover',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.cover === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.cover === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Audio`)} />,
        accessorKey: 'audioWAV',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.audioWAV === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.audioWAV === false) {
            return (
              <div className="w-fit rounded bg-red-500 px-2 py-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Video`)} />,
        accessorKey: 'video',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.video === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.video === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Banners`)} />,
        accessorKey: 'banners',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.banners === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.banners === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Pitch`)} />,
        accessorKey: 'pitch',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.pitch === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.pitch === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`EPK`)} />,
        accessorKey: 'EPKUpdates',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.EPKUpdates === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.EPKUpdates === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={_(msg`WebSite Updates`)} />
        ),
        accessorKey: 'WebSiteUpdates',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.WebSiteUpdates === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.WebSiteUpdates === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: ({ column }) => <DataTableColumnHeader column={column} title={_(msg`Biography`)} />,
        accessorKey: 'Biography',
        enableHiding: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          if (row.original.Biography === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.Biography === false) {
            return (
              <div className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </div>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
    ];
    return columns;
  };

  const columns = createColumns();

  interface ColumnActions {
    onEdit?: (data: ReleaseTableRow) => void;
    onDelete?: (id: number) => void;
  }

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

  // return (
  //   <div className="relative">
  //     <DataTable
  // setIsMultipleDelete={setIsMultipleDelete}
  // isMultipleDelete={isMultipleDelete}
  // columns={columns}
  // onDelete={onDelete}
  // onEdit={onEdit}
  // onRetry={onRetry}
  // onNavegate={onNavegate}
  // data={results.data}
  // onMultipleDelete={onMultipleDelete}
  // perPage={results.perPage}
  // currentPage={results.currentPage}
  // totalPages={results.totalPages}
  // onPaginationChange={onPaginationChange}
  // onMoveDocument={onMoveDocument}
  // columnVisibility={{
  //   sender: team !== undefined,
  // }}
  // error={{
  //   enable: isLoadingError || false,
  // }}
  // skeleton={{
  //   enable: isLoading || false,
  //   rows: 5,
  //   component: (
  //     <DataTableSkeleton
  //       columnCount={columns.length}
  //       cellWidths={['10rem', '30rem', '10rem', '10rem', '6rem', '6rem', '6rem']}
  //       shrinkZero
  //     />
  //   ),
  // }}
  //     >
  //       {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
  //     </DataTable>

  //     {isPending && (
  //       <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
  //         <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
  //       </div>
  //     )}
  //   </div>
  // );
};

type DataTableTitleProps = {
  row: ReleaseTableRow;
  teamUrl?: string;
};
