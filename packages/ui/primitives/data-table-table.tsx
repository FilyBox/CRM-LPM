import * as React from 'react';

import { Trans } from '@lingui/react/macro';
import { TeamMemberRole } from '@prisma/client';
import {
  type Table as TanstackTable,
  type VisibilityState,
  flexRender,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Toaster } from 'sonner';
import { toast as sonnertoast } from 'sonner';
import { match } from 'ts-pattern';

import { StackAvatarsArtistWithTooltip } from '../components/lpm/stack-avatars-artist-with-tooltip';
import { useMediaQuery } from '../lib/use-media-query';
import { cn } from '../lib/utils';
import type { LpmData } from '../types/tables-types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';
import { DataTablePagination } from './data-table-pagination-pagination';
import { ExpandibleCard } from './expandable-card';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;

  columnVisibility?: VisibilityState;
  data: TData[];
  onEdit?: (data: TData) => void;
  onNavegate?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  from?: string;
  onMultipleDelete?: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
  onMoveDocument?: (data: TData) => void;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
  onRetry?: (data: TData) => void;
  onPaginationChange?: (_page: number, _perPage: number) => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
  skeleton?: {
    enable: boolean;
    rows: number;
    component?: React.ReactNode;
  };
  error?: {
    enable: boolean;
    component?: React.ReactNode;
  };
  currentTeamMemberRole?: TeamMemberRole;
}

export type DataTableChildren<TData> = (_table: TanstackTable<TData>) => React.ReactNode;

export type { ColumnDef as DataTableColumnDef } from '@tanstack/react-table';
type enhancedAssignees = {
  artistName: string | null;
  id: number;
};

export function DataTable<TData>({
  table,
  actionBar,
  className,
  columnVisibility,
  data,
  onMultipleDelete,
  isMultipleDelete = false,
  setIsMultipleDelete,
  error,
  currentTeamMemberRole,
  from,
  onEdit,
  onRetry,
  onDelete,
  onNavegate,
  perPage,
  currentPage,
  totalPages,
  skeleton,
  onMoveDocument,
  hasFilters,
  onClearFilters,
  onPaginationChange,
  children,
  ...props
}: DataTableProps<TData>) {
  // console.log('data', data);
  const dateColumnIds = [
    'releaseDate',
    'originalReleaseDate',
    'createdAt',
    'date',
    'preOrderDate',
    'lastProcessDate',
    'timedReleaseDate',
    'timedReleaseMusicServices',
    'importDate',
    'instantGratificationDate',
    'submittedAt',
    'lastModified',
    'startDate',
    'endDate',
  ];

  type enhancedArtists = {
    artistName: string | null;
    id: number;
  };

  type HasId = { id: number | string };
  type HasOptionalFields = {
    status?: string;
    title?: string;
    fileName?: string;
    productTitle?: string;
    total?: number;
    startDate?: Date;
    endDate?: Date;
    artists?: string;
    isPossibleToExpand?: string;
    possibleExtensionTime?: string;
    summary?: string;
    date?: Date;

    releasesArtists?: enhancedArtists[];
    isrcArtists?: enhancedArtists[];
    lpmArtists?: enhancedArtists[];
    tuStreamsArtists?: enhancedAssignees[];
    lanzamiento?: string;
    typeOfRelease?: string;
    release?: string;
    uploaded?: string;
    streamingLink?: string;
    trackPlayLink?: string;
    type?: string;
    assets?: boolean;
    canvas?: boolean;
    cover?: boolean;
    audioWAV?: boolean;
    video?: boolean;
    banners?: boolean;
    pitch?: boolean;
    EPKUpdates?: boolean;
    trackName?: string;
    WebSiteUpdates?: boolean;
    Biography?: boolean;
    label?: string;
    UPC?: string;
    userId?: number;
    teamId?: number;
    license?: string;
    duration?: string;
    isrc?: string;
    createdAt?: Date;
    updatedAt?: Date;
    submissionStatus?: string;
  };

  const isDesktop = useMediaQuery('(min-width: 640px)');

  const prepareCardData = (row: TData) => {
    const typedRow = row as HasId & HasOptionalFields;

    const lpmData = row as LpmData;
    const statusElements = [
      typedRow.status || typedRow.type || typedRow.duration,
      typedRow.license || typedRow.typeOfRelease,
      typedRow.release,
      typedRow.label,

      typedRow.submissionStatus,
    ].filter((item): item is string => item !== undefined);

    const title: string | undefined =
      typedRow.title || typedRow.lanzamiento || typedRow.productTitle || typedRow.trackName;
    // Prepare contributors/artists data
    let contributors: { name: string }[] = [];
    if (typedRow.artists) {
      contributors = typedRow.artists.split(',').map((name) => ({ name: name.trim() }));
    } else if (typedRow.releasesArtists) {
      contributors = typedRow.releasesArtists.map((artist: enhancedArtists) => ({
        name: artist.artistName || 'Unknown',
      }));
    } else if (typedRow.isrcArtists) {
      contributors = typedRow.isrcArtists.map((artist: enhancedArtists) => ({
        name: artist.artistName || 'Unknown',
      }));
    } else if (typedRow.tuStreamsArtists) {
      contributors = typedRow.tuStreamsArtists.map((artist: enhancedArtists) => ({
        name: artist.artistName || 'Unknown',
      }));
    }

    return {
      status: statusElements,
      title: title || 'Untitled',
      fileName: typedRow.fileName,
      startDate: typedRow.startDate || typedRow.date || null,
      endDate: typedRow.endDate,
      contributors,
      expandible: typedRow.isPossibleToExpand || '',
      extensionTime: typedRow.possibleExtensionTime || '',
      summary: typedRow.summary || '',
      link: typedRow.streamingLink || '' || typedRow.trackPlayLink || '',
      githubStars: 128,
      openIssues: 5,
      LpmData: lpmData,
      isrc: typedRow.isrc || typedRow.UPC || '',
      assets: Boolean(typedRow.assets),
      canvas: Boolean(typedRow.canvas),
      cover: Boolean(typedRow.cover),
      audioWAV: Boolean(typedRow.audioWAV),
      video: Boolean(typedRow.video),
      banners: Boolean(typedRow.banners),
      pitch: Boolean(typedRow.pitch),
      EPKUpdates: Boolean(typedRow.EPKUpdates),
      WebSiteUpdates: Boolean(typedRow.WebSiteUpdates),
      Biography: Boolean(typedRow.Biography),
      total: typedRow.total || 0,
      from: from || '',
    };
  };

  const canEditDelete = match(currentTeamMemberRole)
    .with(TeamMemberRole.ADMIN, () => true)
    .with(TeamMemberRole.MANAGER, () => true)
    .with(TeamMemberRole.MEMBER, () => false)
    .otherwise(() => true);

  return (
    <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...props}>
      {children}
      <div className="overflow-hidden rounded-md">
        <Toaster richColors />
        {isDesktop ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild className="h-fit w-fit">
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="hover:bg-muted/50 cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{ maxWidth: '200px' }}
                          >
                            {cell.column.id === 'linerNotes' &&
                            typeof cell.getValue() === 'string' ? (
                              `${(cell.getValue() as string).substring(0, 50)}${(cell.getValue() as string).length > 50 ? '...' : ''}`
                            ) : cell.column.id === 'productPlayLink' && cell.getValue() ? (
                              <a
                                href={cell.getValue() as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link
                              </a>
                            ) : (cell.column.id === 'fileName' && cell.getValue()) ||
                              (cell.column.id === 'title' && cell.getValue()) ? (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>{cell.getValue() as string}</TooltipTrigger>
                                    <TooltipContent className="break-words">
                                      {cell.getValue() as string}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            ) : cell.column.id === 'summary' && cell.getValue() ? (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>{cell.getValue() as string}</TooltipTrigger>
                                    <TooltipContent className="max-w-40 break-words">
                                      {cell.getValue() as string}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            ) : (cell.column.id === 'lpmArtists' && cell.getValue()) ||
                              (cell.column.id === 'isrcArtists' && cell.getValue()) ||
                              (cell.column.id === 'tuStreamsArtists' && cell.getValue()) ||
                              (cell.column.id === 'releasesArtists' && cell.getValue()) ? (
                              <>
                                {/* <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger>{cell.getValue() as string}</TooltipTrigger>
                                         <TooltipContent>{cell.getValue() as string}</TooltipContent>
                                       </Tooltip>
                                     </TooltipProvider> */}

                                <StackAvatarsArtistWithTooltip
                                  enhancedAssignees={cell.getValue() as enhancedAssignees[]}
                                />
                              </>
                            ) : cell.column.id === 'trackPlayLink' && cell.getValue() ? (
                              <a
                                href={cell.getValue() as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link
                              </a>
                            ) : cell.column.id === 'vevoChannel' && cell.getValue() ? (
                              <a
                                href={cell.getValue() as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link
                              </a>
                            ) : cell.column.id === 'lyrics' &&
                              typeof cell.getValue() === 'string' ? (
                              `${(cell.getValue() as string).substring(0, 50)}${(cell.getValue() as string).length > 50 ? '...' : ''}`
                            ) : dateColumnIds.includes(cell.column.id) ? (
                              `${cell.getValue() ? format(cell.getValue() as Date, 'd MMM yyyy', { locale: es }) : '-'}`
                            ) : cell.column.id === 'writersComposers' &&
                              typeof cell.getValue() === 'string' ? (
                              `${(cell.getValue() as string).substring(0, 50)}${(cell.getValue() as string).length > 50 ? '...' : ''}`
                            ) : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      {onEdit && canEditDelete && (
                        <ContextMenuItem
                          onClick={() => {
                            onEdit(row.original);
                          }}
                          inset
                        >
                          Edit
                        </ContextMenuItem>
                      )}

                      {onNavegate && (
                        <ContextMenuItem
                          onClick={() => {
                            onNavegate(row.original);
                          }}
                          inset
                        >
                          View
                        </ContextMenuItem>
                      )}

                      {onRetry && (
                        <ContextMenuItem
                          onClick={() => {
                            onRetry(row.original);
                          }}
                          inset
                        >
                          Retry
                        </ContextMenuItem>
                      )}

                      {onMoveDocument && (
                        <ContextMenuItem
                          onClick={() => {
                            onMoveDocument(row.original);
                          }}
                          inset
                        >
                          Move To Folder
                        </ContextMenuItem>
                      )}

                      {onDelete && canEditDelete && (
                        <ContextMenuItem
                          onClick={() => {
                            sonnertoast.warning('Esta acción sera permanente', {
                              description: 'Estas seguro que quieres eliminar este elemento?',
                              action: {
                                label: 'Eliminar',
                                onClick: () => onDelete(row.original),
                              },
                            });
                          }}
                          inset
                        >
                          Delete
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                ))
              ) : error?.enable ? (
                <TableRow>
                  {error.component ?? (
                    <TableCell colSpan={4} className="h-32 text-center">
                      <Trans>Something went wrong.</Trans>
                    </TableCell>
                  )}
                </TableRow>
              ) : skeleton?.enable ? (
                Array.from({ length: skeleton.rows }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`}>
                    {skeleton.component ?? <Skeleton />}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <p>
                      <Trans>No results found</Trans>
                    </p>

                    {hasFilters && onClearFilters !== undefined && (
                      <button
                        onClick={() => onClearFilters()}
                        className="text-foreground mt-1 text-sm"
                      >
                        <Trans>Clear filters</Trans>
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col gap-5">
            {skeleton?.enable ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-64 w-full" />
                {/* <Skeleton className="h-56 w-full" />
                <Skeleton className="h-56 w-full" /> */}
              </div>
            ) : (data && data.length) > 0 ? (
              data.map((row, index) => {
                return (
                  <ExpandibleCard
                    key={index}
                    {...prepareCardData(row)}
                    {...(onNavegate && { onNavegate: () => onNavegate(row) })}
                    {...(onEdit && { onEdit: () => onEdit(row) })}
                    {...(onDelete && { onDelete: () => onDelete(row) })}
                  />
                );
              })
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination loading={skeleton?.enable || false} table={table} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  );
}
