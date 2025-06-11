import { useMemo, useTransition } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Loader } from 'lucide-react';
import { CheckIcon, XIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { Link } from 'react-router';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindReleaseResponse } from '@documenso/trpc/server/releases-router/schema';
import type { DataTableColumnDef } from '@documenso/ui/primitives/data-table';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

import { useOptionalCurrentTeam } from '~/providers/team';

// export type DocumentsTableProps = {
//   data?: TFindReleaseResponse;
//   isLoading?: boolean;
//   isLoadingError?: boolean;
//   onMoveDocument?: (documentId: number) => void;
//     onAdd: () => void;
//   onEdit: (data: TData) => void;
//   onDelete: (data: TData) => void;
// };

interface DataTableProps<TData, TValue> {
  data?: TFindReleaseResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
}

type DocumentsTableRow = TFindReleaseResponse['data'][number];

export const ReleasesTable = ({
  data,
  isLoading,
  isLoadingError,
  onAdd,
  onEdit,
  onDelete,
}: DataTableProps<DocumentsTableRow, DocumentsTableRow>) => {
  const { _, i18n } = useLingui();

  const team = useOptionalCurrentTeam();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useUpdateSearchParams();

  const columns = useMemo(() => {
    return [
      {
        header: _(msg`Created`),
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          i18n.date(row.original.createdAt, { ...DateTime.DATETIME_SHORT, hourCycle: 'h12' }),
      },
      {
        header: _(msg`Date`),
        accessorKey: 'date',
        cell: ({ row }) => row.original.date || '-',
      },
      {
        header: _(msg`Artist`),
        accessorKey: 'artist',
        cell: ({ row }) => row.original.artist || '-',
      },
      {
        header: _(msg`Release Title`),
        accessorKey: 'lanzamiento',
        cell: ({ row }) => row.original.lanzamiento || '-',
      },
      {
        header: _(msg`Type`),
        accessorKey: 'typeOfRelease',
        cell: ({ row }) => row.original.typeOfRelease || '-',
      },
      {
        header: _(msg`Release Status`),
        accessorKey: 'release',
        cell: ({ row }) => row.original.release || '-',
      },
      {
        header: _(msg`Uploaded`),
        accessorKey: 'uploaded',
        cell: ({ row }) => row.original.uploaded || '-',
      },
      {
        header: _(msg`Streaming Link`),
        accessorKey: 'streamingLink',
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
        header: _(msg`Assets`),
        accessorKey: 'assets',
        cell: ({ row }) => row.original.assets || '-',
      },

      {
        header: _(msg`Canvas`),
        accessorKey: 'canvas',
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
        header: _(msg`Cover`),
        accessorKey: 'cover',
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
        header: _(msg`Audio`),
        accessorKey: 'audioWAV',
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
        header: _(msg`Video`),
        accessorKey: 'video',
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
        header: _(msg`Banners`),
        accessorKey: 'banners',
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
        header: _(msg`Pitch`),
        accessorKey: 'pitch',
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
        header: _(msg`EPK`),
        accessorKey: 'EPKUpdates',
        cell: ({ row }) => {
          if (row.original.EPKUpdates === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.EPKUpdates === false) {
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
        header: _(msg`WebSiteUpdates`),
        accessorKey: 'WebSiteUpdates',
        cell: ({ row }) => {
          if (row.original.WebSiteUpdates === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.WebSiteUpdates === false) {
            return (
              <span className="w-fit rounded bg-red-500 p-1 text-white">
                <XIcon size={16} />
              </span>
            );
          } else {
            return <span className="text-muted-foreground">-</span>;
          }
        },
      },
      {
        header: _(msg`Biography`),
        accessorKey: 'Biography',
        cell: ({ row }) => {
          if (row.original.Biography === true) {
            return (
              <div className="w-fit rounded bg-green-500 p-1 text-white">
                <CheckIcon size={16} />
              </div>
            );
          } else if (row.original.Biography === false) {
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

      // {
      //   header: _(msg`Actions`),
      //   cell: ({ row }) =>
      //     (!row.original.deletedAt || isDocumentCompleted(row.original.status)) && (
      //       <div className="flex items-center gap-x-4">
      //         <DocumentsTableActionButton row={row.original} />
      //         <DocumentsTableActionDropdown
      //           row={row.original}
      //           onMoveDocument={onMoveDocument ? () => onMoveDocument(row.original.id) : undefined}
      //         />
      //       </div>
      //     ),
      // },
    ] satisfies DataTableColumnDef<DocumentsTableRow>[];
  }, [team]);

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
        columns={columns}
        onDelete={onDelete}
        onEdit={onEdit}
        data={results.data}
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
            <>
              <TableCell>
                <Skeleton className="h-4 w-40 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 rounded-full" />
              </TableCell>
              <TableCell className="py-4">
                <div className="flex w-full flex-row items-center">
                  <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-24 rounded" />
              </TableCell>
            </>
          ),
        }}
      >
        {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
      </DataTable>

      {isPending && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
          <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
};

type DataTableTitleProps = {
  row: DocumentsTableRow;
  teamUrl?: string;
};
