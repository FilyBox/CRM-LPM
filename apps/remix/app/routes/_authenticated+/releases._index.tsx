import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useNavigate, useSearchParams } from 'react-router';
import { Link } from 'react-router';
import { z } from 'zod';

import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { parseToIntegerArray } from '@documenso/lib/utils/params';
import { formReleasePath } from '@documenso/lib/utils/teams';
import { type Team } from '@documenso/prisma/client';
import { type Releases } from '@documenso/prisma/client';
import type { ExtendedRelease } from '@documenso/prisma/types/extended-release';
import { ExtendedReleaseType } from '@documenso/prisma/types/extended-release';
import { trpc } from '@documenso/trpc/react';
import {
  type TFindReleaseInternalResponse,
  type TFindReleaseResponse,
  ZFindReleaseInternalRequestSchema,
} from '@documenso/trpc/server/releases-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import FormReleases from '@documenso/ui/primitives/form-releases';
import { Input } from '@documenso/ui/primitives/input';
import { Tabs, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { AdvancedFilterDialog } from '~/components/dialogs/advanced-filte-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { PeriodSelector } from '~/components/general/period-selector';
import { ReleaseType } from '~/components/general/task/release-type';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { TableArtistFilter } from '~/components/tables/lpm-table-artist-filter';
import { ReleasesTable } from '~/components/tables/releases-table';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export function meta() {
  return appMetaTags('Releases');
}

const sortColumns = z
  .enum([
    'createdAt',
    'date',
    'lanzamiento',
    'typeOfRelease',
    'release',
    'uploaded',
    'streamingLink',
    'assets',
    'canvas',
    'cover',
    'audioWAV',
    'video',
    'banners',
    'pitch',
    'EPKUpdates',
    'WebSiteUpdates',
    'Biography',
  ])
  .optional();
export const TypeSearchParams = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string()), z.undefined()]),
);

const ZSearchParamsSchema = ZFindReleaseInternalRequestSchema.pick({
  type: true,
  release: true,
  period: true,
  page: true,
  perPage: true,
  query: true,
}).extend({
  artistIds: z.string().transform(parseToIntegerArray).optional().catch([]),
});
export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const sort = useMemo(
    () => TypeSearchParams.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );

  const columnOrder = useMemo(() => {
    if (sort.sort) {
      try {
        const parsedSort = JSON.parse(sort.sort as string);
        if (Array.isArray(parsedSort) && parsedSort.length > 0) {
          const { id } = parsedSort[0];
          const isValidColumn = sortColumns.safeParse(id);
          return isValidColumn.success ? id : undefined;
        }
      } catch (error) {
        console.error('Error parsing sort parameter:', error);
        return 'date';
      }
    }
    return 'date';
  }, [sort]);

  const columnDirection = useMemo(() => {
    if (sort.sort) {
      try {
        const parsedSort = JSON.parse(sort.sort as string);
        if (Array.isArray(parsedSort) && parsedSort.length > 0) {
          const { desc } = parsedSort[0];
          return desc ? 'desc' : 'asc';
        }
      } catch (error) {
        console.error('Error parsing sort parameter:', error);
        return 'asc';
      }
    }
    return 'asc';
  }, [sort]);

  const findDocumentSearchParams = useMemo(() => {
    const searchParamsObject = Object.fromEntries(searchParams.entries());

    const result = ZSearchParamsSchema.safeParse(searchParamsObject);

    if (!result.success) {
      return {
        type: ['EP', 'Album', 'Sencillo', 'ALL'].includes(searchParamsObject.type)
          ? (searchParamsObject.type as ExtendedReleaseType)
          : undefined,
        release: searchParamsObject.release as ExtendedRelease,
        period: searchParamsObject.period as '7d' | '14d' | '30d',
        page: searchParamsObject.page ? Number(searchParamsObject.page) : undefined,
        perPage: searchParamsObject.perPage ? Number(searchParamsObject.perPage) : undefined,
        query: searchParamsObject.query,
      };
    }

    return result.data;
  }, [searchParams]);

  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const releasesRootPath = formReleasePath(team?.url);

  const { data, isLoading, isLoadingError, refetch } = trpc.release.findRelease.useQuery({
    query: findDocumentSearchParams.query,
    type: findDocumentSearchParams.type,
    release: findDocumentSearchParams.release,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
    artistIds: findDocumentSearchParams.artistIds,
    orderByColumn: columnOrder,
    orderByDirection: columnDirection,
  });

  const { data: artistData, isLoading: artistDataloading } =
    trpc.release.findReleasesUniqueArtists.useQuery();

  const createManyReleasesMutation = trpc.release.createManyReleases.useMutation();

  const createMutation = trpc.release.createRelease.useMutation();
  const updateMutation = trpc.release.updateRelease.useMutation();
  const deleteMutation = trpc.release.deleteRelease.useMutation();
  // const convertDatesMutation = trpc.release.convertDates.useMutation();
  const deleteMultipleMutation = trpc.release.deleteMultipleByIds.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dataIntial, setData] = useState<TFindReleaseResponse | null>(null);
  const [editingUser, setEditingUser] = useState<Releases | null>(null);
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);

  const [type, setType] = useState<TFindReleaseInternalResponse['type']>({
    [ExtendedReleaseType.Album]: 0,
    [ExtendedReleaseType.EP]: 0,
    [ExtendedReleaseType.Sencillo]: 0,
    [ExtendedReleaseType.ALL]: 0,
  });

  useEffect(() => {
    if (data?.releases) {
      setData(data.releases);
    }
  }, [data]);

  useEffect(() => {
    if (data?.types) {
      setType(data.types);
    }
  }, [data?.types]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const spanishMonths: Record<string, number> = {
    enero: 0,
    Enero: 0,
    febrero: 1,
    Febrero: 1,
    marzo: 2,
    Marzo: 2,
    abril: 3,
    Abril: 3,
    mayo: 4,
    Mayo: 4,
    junio: 5,
    Junio: 5,
    julio: 6,
    Julio: 6,
    agosto: 7,
    Agosto: 7,
    septiembre: 8,
    Septiembre: 8,
    octubre: 9,
    Octubre: 9,
    noviembre: 10,
    Noviembre: 10,
    diciembre: 11,
    Diciembre: 11,
  };

  function parseSpanishDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      const normalizedInput = dateString.trim();

      const regex = /(\d+)(?:\s+de)?\s+([a-zA-Zé]+)(?:\s+de\s+(\d{4}))?/;
      const match = normalizedInput.match(regex);

      if (!match) return null;

      const day = parseInt(match[1], 10);
      const monthName = match[2];
      // If year is provided use it, otherwise use current year
      const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();

      if (!Object.prototype.hasOwnProperty.call(spanishMonths, monthName)) return null;
      const month = spanishMonths[monthName];
      const date = new Date(year, month, day);

      return date;
    } catch (error) {
      console.error(`Failed to parse date: ${dateString}`, error);
      return null;
    }
  }

  // Format date to ISO string or in a custom format
  function formatDate(date: Date | null): string {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setIsSubmitting(true);
    try {
      const csvData = await parseCsvFile(csvFile);

      const validatedData = csvData.map((item) => {
        console.log('CSV Item:', item);
        const parsedDate = parseSpanishDate(item['Fecha'] || '');
        console.log("item['Fecha']:", item['Fecha']);
        console.log('Parsed Date:', parsedDate);
        const formattedDate = formatDate(parsedDate);

        // Validate typeOfRelease to ensure it's one of the allowed values
        let typeOfRelease: 'Sencillo' | 'Album' | 'EP' | undefined = undefined;
        if (
          item['Tipo de Release'] === 'Sencillo' ||
          item['Tipo de Release'] === 'Album' ||
          item['Tipo de Release'] === 'EP'
        ) {
          typeOfRelease = item['Tipo de Release'] as 'Sencillo' | 'Album' | 'EP';
        }

        // Validate release to ensure it's one of the allowed values
        let release: 'Soft' | 'Focus' | undefined = undefined;
        if (item['Release'] === 'Soft' || item['Release'] === 'Focus') {
          release = item['Release'] as 'Soft' | 'Focus';
        }

        // Convert string values to boolean for boolean fields
        const convertToBoolean = (value: string | undefined): boolean | undefined => {
          if (value === undefined) return undefined;
          return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
        };

        return {
          date: formattedDate || undefined,
          artist: item['Artista'] || undefined,
          lanzamiento: item['Lanzamiento'] || undefined,
          typeOfRelease,
          release,
          uploaded: item['Uploaded'] || undefined,
          streamingLink: item['Streaming Link'] || undefined,
          assets: convertToBoolean(item['Assets']) || undefined,
          canvas: convertToBoolean(item['Canvas']),
          cover: convertToBoolean(item['Portada']), // Convert cover to boolean
          audioWAV: convertToBoolean(item['Audio WAV']), // Convert audioWAV to boolean
          video: convertToBoolean(item['Video']),
          banners: convertToBoolean(item['Banners']),
          pitch: convertToBoolean(item['Pitch']),

          EPKUpdates: convertToBoolean(item['Actualización del EPK']),
          WebSiteUpdates: convertToBoolean(item['Actualización del sitio web']),
          Biography: convertToBoolean(item['Actualización de Biografía']),
        };
      });
      // Filtrar cualquier objeto que esté completamente vacío (por si hay filas vacías en el CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== ''),
      );

      // Usar la mutación para crear múltiples registros
      const result = await createManyReleasesMutation.mutateAsync({
        releases: filteredData,
      });

      toast({
        description: `Se han creado
           ${result} 
           registros exitosamente`,
      });

      // Refrescar los datos
      await refetch();
      setCsvFile(null);
    } catch (error) {
      console.error('Error al procesar el CSV:', error);
      toast({
        variant: 'destructive',
        description: 'Error al procesar el archivo CSV: ',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (newRecord: Omit<Releases, 'id'>) => {
    try {
      const { id } = await createMutation.mutateAsync({
        date: newRecord.date || undefined,
        artist: newRecord.artist || undefined,
        lanzamiento: newRecord.lanzamiento || undefined,
        typeOfRelease: newRecord.typeOfRelease || undefined,
        release: newRecord.release || undefined,
        uploaded: newRecord.uploaded || undefined,
        streamingLink: newRecord.streamingLink || undefined,
        assets: newRecord.assets || undefined,
        canvas: newRecord.canvas || undefined,
        cover: newRecord.cover || undefined,
        audioWAV: newRecord.audioWAV || undefined,
        video: newRecord.video || undefined,
        banners: newRecord.banners || undefined,
        pitch: newRecord.pitch || undefined,
        EPKUpdates: newRecord.EPKUpdates || undefined,
        WebSiteUpdates: newRecord.WebSiteUpdates || undefined,
        Biography: newRecord.Biography || undefined,
      });
      console.log('Created Record ID:', id);
      setIsDialogOpen(false);
      toast({
        description: 'Data added successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error adding data',
      });
      console.error('Error creating record:', error);
    } finally {
      await refetch();
    }
    console.log('New Record:', newRecord);
    // const record = { ...newRecord, id: Number(dataIntial?.releases?.length ?? 0) + 1 };

    setIsDialogOpen(false);
  };

  const handleUpdate = async (updated: Releases) => {
    console.log('Updated User:', updated);
    console.log('id', updated.id);
    try {
      const { id } = await updateMutation.mutateAsync({
        id: updated.id,
        date: updated.date || undefined,
        artist: updated.artist || undefined,
        lanzamiento: updated.lanzamiento || undefined,
        typeOfRelease: updated.typeOfRelease || undefined,
        release: updated.release || undefined,
        uploaded: updated.uploaded || undefined,
        streamingLink: updated.streamingLink || undefined,
        assets: updated.assets || undefined,
        canvas: updated.canvas || undefined,
        cover: updated.cover || undefined,
        audioWAV: updated.audioWAV || undefined,
        video: updated.video || undefined,
        banners: updated.banners || undefined,
        pitch: updated.pitch || undefined,
        EPKUpdates: updated.EPKUpdates || undefined,
        WebSiteUpdates: updated.WebSiteUpdates || undefined,
        Biography: updated.Biography || undefined,
      });

      console.log('Updated Record ID:', id);

      // if (dataIntial) {
      //   setData({
      //     ...dataIntial,
      //     data: dataIntial.data.map((record) => (record.id === updated.id ? updated : record)),
      //   });
      // }
      setIsDialogOpen(false);
      setEditingUser(null);
      toast({
        description: 'Data updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error updating data',
      });
      console.error('Error updating record:', error);
    } finally {
      await refetch();
    }
  };

  const handleEdit = (record: TFindReleaseResponse['data'][number]) => {
    setEditingUser(record as Releases);
    setIsDialogOpen(true);
  };

  const handleDelete = async (deleteData: TFindReleaseResponse['data'][number]) => {
    try {
      if (dataIntial) {
        await deleteMutation.mutateAsync({ releaseId: deleteData.id });

        toast({
          description: 'Data deleted successfully',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
    } finally {
      await refetch();
    }
  };

  const handleMultipleDelete = async (ids: number[]) => {
    try {
      console.log('Deleting records with IDs in index contracts:', ids);
      await deleteMultipleMutation.mutateAsync({ ids: ids });

      toast({
        description: `${ids.length} deleted successfully`,
      });
      await refetch();
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
    } finally {
      setIsMultipleDelete(false);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  // const [release, setRelease] = useState<TFindReleaseInternalResponse['release']>({
  //   [ExtendedRelease.Focus]: 0,
  //   [ExtendedRelease.Soft]: 0,
  //   [ExtendedRelease.ALL]: 0,
  // });

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  const getTabHref = (value: keyof typeof ExtendedReleaseType) => {
    const params = new URLSearchParams(searchParams);

    params.set('type', value);

    if (value === ExtendedReleaseType.ALL) {
      params.delete('type');
    }

    if (params.has('page')) {
      params.delete('page');
    }

    return `${formReleasePath(team?.url)}?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-screen-xl gap-y-8 px-4 md:px-8">
      {/* <CardsChat /> */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit' : 'Create New'}</DialogTitle>
            <DialogDescription>
              Please fill out the form below to{' '}
              {editingUser ? 'update the data' : 'create a new data'}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <FormReleases
              onSubmit={editingUser ? handleUpdate : handleCreate}
              initialData={editingUser}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-8 pt-1">
        <div className="flex flex-row items-center">
          {team && (
            <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
              {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
              <AvatarFallback className="text-muted-foreground text-xs">
                {team.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <h1 className="truncate text-2xl font-semibold md:text-3xl">
            <Trans>Releases</Trans>
          </h1>
        </div>

        <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
          <Tabs value={findDocumentSearchParams.type || 'ALL'} className="overflow-x-auto">
            <TabsList>
              {['Sencillo', 'Album', 'EP', 'ALL'].map((value) => {
                return (
                  <TabsTrigger
                    key={value}
                    className="hover:text-foreground min-w-[60px]"
                    value={value}
                    asChild
                  >
                    <Link
                      to={getTabHref(value as keyof typeof ExtendedReleaseType)}
                      preventScrollReset
                    >
                      <ReleaseType type={value as ExtendedReleaseType} />

                      {value !== 'ALL' && (
                        <span className="ml-1 inline-block opacity-50">
                          {type[value as ExtendedReleaseType]}
                        </span>
                      )}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-4 sm:w-48">
            <PeriodSelector />
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-2 sm:w-48">
            <TableArtistFilter artistData={artistData} isLoading={artistDataloading} />
          </div>

          <div className="flex w-full items-center justify-between gap-x-2 sm:w-80">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Cargar CSV'}
            </Button>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-2 sm:w-48">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
          <AdvancedFilterDialog tableToConsult="Releases" />
          <Button className="w-full sm:w-48" onClick={openCreateDialog}>
            Create Release
          </Button>
        </div>

        <div className="mt w-full">
          {data && (!data?.releases.data.length || data?.releases.data.length === 0) ? (
            <GeneralTableEmptyState status={'ALL'} />
          ) : (
            // <p>sin data</p>
            <ReleasesTable
              onMultipleDelete={handleMultipleDelete}
              isMultipleDelete={isMultipleDelete}
              setIsMultipleDelete={setIsMultipleDelete}
              data={data?.releases}
              isLoading={isLoading}
              isLoadingError={isLoadingError}
              onAdd={openCreateDialog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
