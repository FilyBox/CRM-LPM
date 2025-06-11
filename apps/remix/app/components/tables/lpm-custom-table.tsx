import { useTransition } from 'react';

import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindLpmResponse } from '@documenso/trpc/server/lpm-router/schema';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';

import { DataTableSkeleton } from '~/components/tables/data-table-skeleton';
import { useOptionalCurrentTeam } from '~/providers/team';

interface DataTableProps<TData, TValue> {
  data?: TFindLpmResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
  onMultipleDelete: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
}

type DocumentsTableRow = TFindLpmResponse['data'][number];

export const LpmTable = ({
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
        accessorKey: 'id',
        header: 'ID',
        enableHiding: true,
      },
      {
        accessorKey: 'productId',
        header: 'Product ID',
        enableHiding: true,
      },
      {
        accessorKey: 'productType',
        header: 'Product Type',
        enableHiding: true,
      },
      {
        accessorKey: 'productTitle',
        header: 'Product Title',
        enableHiding: true,
      },
      {
        accessorKey: 'productVersion',
        header: 'Product Version',
        enableHiding: true,
      },
      {
        accessorKey: 'lpmArtists',
        header: 'Product Display Artist',
        enableHiding: true,
      },
      {
        accessorKey: 'parentLabel',
        header: 'Parent Label',
        enableHiding: true,
      },
      {
        accessorKey: 'label',
        header: 'Label',
        enableHiding: true,
      },
      {
        accessorKey: 'originalReleaseDate',
        header: 'Original Release Date',
        enableHiding: true,
      },
      {
        accessorKey: 'releaseDate',
        header: 'Release Date',
        enableHiding: true,
      },
      {
        accessorKey: 'upc',
        header: 'UPC',
        enableHiding: true,
      },
      {
        accessorKey: 'catalog',
        header: 'Catalog',
        enableHiding: true,
      },
      {
        accessorKey: 'productPriceTier',
        header: 'Product Price Tier',
        enableHiding: true,
      },
      {
        accessorKey: 'productGenre',
        header: 'Product Genre',
        enableHiding: true,
      },
      {
        accessorKey: 'submissionStatus',
        header: 'Submission Status',
        enableHiding: true,
      },
      {
        accessorKey: 'productCLine',
        header: 'Product C Line',
        enableHiding: true,
      },
      {
        accessorKey: 'productPLine',
        header: 'Product P Line',
        enableHiding: true,
      },
      {
        accessorKey: 'preOrderDate',
        header: 'PreOrder Date',
        enableHiding: true,
      },
      {
        accessorKey: 'exclusives',
        header: 'Exclusives',
        enableHiding: true,
      },
      {
        accessorKey: 'explicitLyrics',
        header: 'Explicit Lyrics',
        enableHiding: true,
      },
      {
        accessorKey: 'productPlayLink',
        header: 'Product Play Link',
        enableHiding: true,
      },
      {
        accessorKey: 'linerNotes',
        header: 'Liner Notes',
        size: 50,
        maxSize: 50,
        enableHiding: true,
      },
      {
        accessorKey: 'primaryMetadataLanguage',
        header: 'Primary Metadata Language',
        enableHiding: true,
      },
      {
        accessorKey: 'compilation',
        header: 'Compilation',
        enableHiding: true,
      },
      {
        accessorKey: 'pdfBooklet',
        header: 'PDF Booklet',
        enableHiding: true,
      },
      {
        accessorKey: 'timedReleaseDate',
        header: 'Timed Release Date',
        enableHiding: true,
      },
      {
        accessorKey: 'timedReleaseMusicServices',
        header: 'Timed Release Music Services',
        enableHiding: true,
      },
      {
        accessorKey: 'lastProcessDate',
        header: 'Last Process Date',
        enableHiding: true,
      },
      {
        accessorKey: 'importDate',
        header: 'Import Date',
        enableHiding: true,
      },
      {
        accessorKey: 'createdBy',
        header: 'Created By',
        enableHiding: true,
      },
      {
        accessorKey: 'lastModified',
        header: 'Last Modified',
        enableHiding: true,
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted At',
        enableHiding: true,
      },
      {
        accessorKey: 'submittedBy',
        header: 'Submitted By',
        enableHiding: true,
      },
      {
        accessorKey: 'vevoChannel',
        header: 'Vevo Channel',
        enableHiding: true,
      },
      {
        accessorKey: 'trackType',
        header: 'Track Type',
        enableHiding: true,
      },
      {
        accessorKey: 'trackId',
        header: 'Track ID',
        enableHiding: true,
      },
      {
        accessorKey: 'trackVolume',
        header: 'Track Volume',
        enableHiding: true,
      },
      {
        accessorKey: 'trackNumber',
        header: 'Track Number',
        enableHiding: true,
      },
      {
        accessorKey: 'trackName',
        header: 'Track Name',
        enableHiding: true,
      },
      {
        accessorKey: 'trackVersion',
        header: 'Track Version',
        enableHiding: true,
      },
      {
        accessorKey: 'trackDisplayArtist',
        header: 'Track Display Artist',
        enableHiding: true,
      },
      {
        accessorKey: 'isrc',
        header: 'ISRC',
        enableHiding: true,
      },
      {
        accessorKey: 'trackPriceTier',
        header: 'Track Price Tier',
        enableHiding: true,
      },
      {
        accessorKey: 'trackGenre',
        header: 'Track Genre',
        enableHiding: true,
      },
      {
        accessorKey: 'audioLanguage',
        header: 'Audio Language',
        enableHiding: true,
      },
      {
        accessorKey: 'trackCLine',
        header: 'Track C Line',
        enableHiding: true,
      },
      {
        accessorKey: 'trackPLine',
        header: 'Track P Line',
        enableHiding: true,
      },
      {
        accessorKey: 'writersComposers',
        header: 'Writers/Composers',
        enableHiding: true,
      },
      {
        accessorKey: 'publishersCollectionSocieties',
        header: 'Publishers/Collection Societies',
        enableHiding: true,
      },
      {
        accessorKey: 'withholdMechanicals',
        header: 'Withhold Mechanicals',
        enableHiding: true,
      },
      {
        accessorKey: 'preOrderType',
        header: 'PreOrder Type',
        enableHiding: true,
      },
      {
        accessorKey: 'instantGratificationDate',
        header: 'Instant Gratification Date',
        enableHiding: true,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        enableHiding: true,
      },
      {
        accessorKey: 'sampleStartTime',
        header: 'Sample Start Time',
        enableHiding: true,
      },
      {
        accessorKey: 'explicitLyricsTrack',
        header: 'Explicit Lyrics Track',
        enableHiding: true,
      },
      {
        accessorKey: 'albumOnly',
        header: 'Album Only',
        enableHiding: true,
      },
      {
        accessorKey: 'lyrics',
        header: 'Lyrics',
        enableHiding: true,
      },
      {
        accessorKey: 'additionalContributorsPerforming',
        header: 'Additional Contributors (Performing)',
        enableHiding: true,
      },
      {
        accessorKey: 'additionalContributorsNonPerforming',
        header: 'Additional Contributors (Non-Performing)',
        enableHiding: true,
      },
      {
        accessorKey: 'producers',
        header: 'Producers',
        enableHiding: true,
      },
      {
        accessorKey: 'continuousMix',
        header: 'Continuous Mix',
        enableHiding: true,
      },
      {
        accessorKey: 'continuouslyMixedIndividualSong',
        header: 'Continuously Mixed Individual Song',
        enableHiding: true,
      },
      {
        accessorKey: 'trackPlayLink',
        header: 'Track Play Link',
        enableHiding: true,
      },
    ];
    return columns;
  };

  const columns = createColumns();

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
    artist: [],
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
            <DataTableSkeleton
              columnCount={columns.length}
              cellWidths={['10rem', '30rem', '10rem', '10rem', '6rem', '6rem', '6rem']}
              shrinkZero
            />
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
