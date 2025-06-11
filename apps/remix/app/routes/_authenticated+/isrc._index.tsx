import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { type TIsrcSongs } from '@documenso/lib/types/isrc';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { parseToIntegerArray } from '@documenso/lib/utils/params';
import { type IsrcSongs } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { ZFindIsrcSongsInternalRequestSchema } from '@documenso/trpc/server/isrcsong-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { createColumnsIsrc } from '@documenso/ui/primitives/column-custom';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import MyForm from '@documenso/ui/primitives/form-custom-isrc';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { AdvancedFilterDialog } from '~/components/dialogs/advanced-filte-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { IsrcTable } from '~/components/tables/isrc-table';
import { TableArtistFilter } from '~/components/tables/lpm-table-artist-filter';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

// import { type IsrcSongsData } from '@documenso/ui/primitives/types';

type CsvColumnMapping = {
  csvColumn: string;
  field: keyof Omit<IsrcSongs, 'id'> | '';
};

export function meta() {
  return appMetaTags('Isrc');
}

const ZSearchParamsSchema = ZFindIsrcSongsInternalRequestSchema.pick({
  period: true,
  page: true,
  perPage: true,
  query: true,
}).extend({
  artistIds: z.string().transform(parseToIntegerArray).optional().catch([]),
});

export default function IsrcPage() {
  const [searchParams] = useSearchParams();
  const team = useOptionalCurrentTeam();

  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const { data, isLoading, isLoadingError, refetch } = trpc.isrcSongs.findIsrcSongs.useQuery({
    query: findDocumentSearchParams.query,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    artistIds: findDocumentSearchParams.artistIds,

    perPage: findDocumentSearchParams.perPage,
  });

  const { data: artistData, isLoading: artistDataloading } =
    trpc.isrcSongs.findIsrcUniqueArtists.useQuery();

  const createIsrcSongsMutation = trpc.isrcSongs.createIsrcSongs.useMutation();
  const createManyIsrcSongsMutation = trpc.isrcSongs.createManyIsrcSongs.useMutation();
  const updateIsrcSongsMutation = trpc.isrcSongs.updateIsrcSongsById.useMutation();
  const deleteIsrcSongsMutation = trpc.isrcSongs.deleteIsrcSongsById.useMutation();
  const deleteMultipleMutation = trpc.isrcSongs.deleteMultipleByIds.useMutation();
  const { toast } = useToast();

  // type IsrcSongsData = (typeof data.isrcSongs)[number];
  const [dataIntial, setData] = useState<IsrcSongs[]>([]);
  const [editingUser, setEditingUser] = useState<IsrcSongs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);

  const columns = createColumnsIsrc();

  useEffect(() => {
    if (data) {
      setData(data.data);
    }
  }, [data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setIsSubmitting(true);
    try {
      const csvData = await parseCsvFile(csvFile);
      const convertDateFormat = (dateString: string): Date | undefined => {
        if (!dateString || dateString.trim() === '') return undefined;

        try {
          // Asume formato MM/dd/yyyy
          const [month, day, year] = dateString.split('/');
          if (!month || !day || !year) return undefined;

          // Crear fecha en formato ISO (yyyy-MM-dd)
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const date = new Date(isoDate);

          // Verificar que la fecha es válida
          if (isNaN(date.getTime())) return undefined;

          return date;
        } catch (error) {
          console.warn(`Error converting date: ${dateString}`, error);
          return undefined;
        }
      };

      const validatedData = csvData.map((item) => ({
        trackName: item.Track || '', // Mapear "Track" a trackName
        artist: item.Artista || '', // Mapear "Artista" a artist
        duration: item['Duración / Tipo'] || '', // Mapear "Duración / Tipo" a duration
        title: item['Titulo (Álbum/Single/LP/EP)'] || '', // Mapear "Titulo..." a title
        license: item.Licencia || '', // Mapear "Licencia" a license
        date: convertDateFormat(item['Fecha (año)']) || new Date(), // Mapear "Fecha (año)" a date
        isrc: item['ISRC'] || '', // Mapear "ISRC" a isrc
      }));
      // Filtrar cualquier objeto que esté completamente vacío (por si hay filas vacías en el CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== ''),
      );

      const result = await createManyIsrcSongsMutation.mutateAsync({
        isrcSongs: filteredData,
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

  const handleCreate = async (newRecord: Omit<TIsrcSongs, 'id'>) => {
    setIsSubmitting(true);
    console.log('New Record Artists:', newRecord.IsrcArtists);
    try {
      const { id } = await createIsrcSongsMutation.mutateAsync({
        trackName: newRecord.trackName ?? '',
        isrc: newRecord.isrc ?? '',
        artists: newRecord.IsrcArtists ?? [],
        artist: newRecord.artist ?? '',
        duration: newRecord.duration ?? '',
        title: newRecord.title ?? '',
        license: newRecord.license ?? '',
        date: newRecord.date ?? new Date(),
      });
      await refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (updatedIsrcSongs: TIsrcSongs) => {
    console.log('Updated User:', updatedIsrcSongs);
    console.log('id', updatedIsrcSongs.id);
    setIsSubmitting(true);
    try {
      const { id } = await updateIsrcSongsMutation.mutateAsync({
        id: updatedIsrcSongs.id,
        artists: updatedIsrcSongs.IsrcArtists ?? [],

        trackName: updatedIsrcSongs.trackName ?? undefined,
        artist: updatedIsrcSongs.artist ?? undefined,
        duration: updatedIsrcSongs.duration ?? undefined,
        title: updatedIsrcSongs.title ?? undefined,
        license: updatedIsrcSongs.license ?? undefined,
        date: updatedIsrcSongs.date ?? undefined,
      });

      console.log('Updated Record ID:', id);

      setData(
        dataIntial.map((record) => (record.id === updatedIsrcSongs.id ? updatedIsrcSongs : record)),
      );
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deleteData: IsrcSongs) => {
    try {
      setData(dataIntial.filter((record) => record.id !== deleteData.id));
      await deleteIsrcSongsMutation.mutateAsync({ id: deleteData.id });

      toast({
        description: 'Data deleted successfully',
      });
    } catch (error) {
      setData((prevData) => [...prevData, deleteData]);
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
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
  const handleEdit = (record: IsrcSongs) => {
    setEditingUser(record);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-y-8 px-4 md:px-8">
      <div className="mt-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
        <div className="flex flex-row items-center">
          {team && (
            <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
              {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
              <AvatarFallback className="text-muted-foreground text-xs">
                {team.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <h2 className="text-4xl font-semibold">
            <Trans>Isrc</Trans>
          </h2>
        </div>

        <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
          <div className="flex w-full items-center justify-between gap-x-2 sm:w-80">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Cargar CSV'}
            </Button>
          </div>
          <Button onClick={openCreateDialog}>Add Item</Button>
          <TableArtistFilter artistData={artistData} isLoading={artistDataloading} />
          <AdvancedFilterDialog tableToConsult="Isrc" />

          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <div>
            <MyForm
              artistData={artistData}
              isSubmitting={isSubmitting}
              onSubmit={editingUser ? handleUpdate : handleCreate}
              initialData={editingUser}
            />
          </div>
        </DialogContent>
      </Dialog>
      {data && (!data?.data.length || data?.data.length === 0) ? (
        <GeneralTableEmptyState status={'ALL'} />
      ) : (
        <IsrcTable
          data={data}
          onMultipleDelete={handleMultipleDelete}
          setIsMultipleDelete={setIsMultipleDelete}
          isMultipleDelete={isMultipleDelete}
          isLoading={isLoading}
          isLoadingError={isLoadingError}
          onAdd={openCreateDialog}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
