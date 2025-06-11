import type { ColumnDef } from '@tanstack/react-table';

import { type lpm } from '@documenso/prisma/client';
import type { IsrcSongs } from '@documenso/prisma/client';

// interface ColumnActions {
//   onEdit?: (data: lpm) => void;
//   onDelete?: (id: number) => void;
// }

export const createColumns = (): ColumnDef<lpm>[] => {
  // const columns: ColumnDef<lpm>[] = [
  //   {
  //     accessorKey: 'id',
  //     header: 'ID',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'productId',
  //     header: 'Product ID',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'upc',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'trackName',
  //     header: 'Name',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'productType',
  //     header: 'Product Type',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'releaseDate',
  //     header: 'Release Date',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'trackDisplayArtist',
  //     header: 'Artist',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'label',
  //     header: 'Label',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'submissionStatus',
  //     header: 'Status',
  //     enableHiding: true,
  //   },
  //   {
  //     accessorKey: 'lastModified',
  //     header: 'Last Modified',
  //     enableHiding: true,
  //   },

  // ];
  const columns: ColumnDef<lpm>[] = [
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
      accessorKey: 'productDisplayArtist',
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
  // columns.push({
  //   id: 'actions',
  //   cell: ({ row, table }) => {
  //     const record = row.original;
  //     const { onEdit, onDelete } = table.options.meta as ColumnActions;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>

  //           {onEdit && <DropdownMenuItem onClick={() => onEdit(record)}>Edit</DropdownMenuItem>}

  //           {onDelete && (
  //             <DropdownMenuItem onClick={() => onDelete(record.id)}>Delete</DropdownMenuItem>
  //           )}
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // });

  return columns;
};

export const createColumnsIsrc = (): ColumnDef<IsrcSongs>[] => {
  const columns: ColumnDef<IsrcSongs>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableHiding: true,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      enableHiding: true,
    },
    {
      accessorKey: 'artist',
      header: 'Artist',
      enableHiding: true,
    },
    {
      accessorKey: 'trackName',
      header: 'Track Name',
      enableHiding: true,
    },
    {
      accessorKey: 'isrc',
      header: 'ISRC',
      enableHiding: true,
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      enableHiding: true,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      enableHiding: true,
    },
    {
      accessorKey: 'license',
      header: 'License',
    },
  ];

  return columns;
};
