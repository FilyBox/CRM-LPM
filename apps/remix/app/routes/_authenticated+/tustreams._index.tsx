import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { TypeOfTuStreams } from '@prisma/client';
import { useNavigate, useSearchParams } from 'react-router';
import { Link } from 'react-router';
import { z } from 'zod';

import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { type TtuStreams } from '@documenso/lib/types/tustreams';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { parseToIntegerArray } from '@documenso/lib/utils/params';
import { formTuStreamsPath } from '@documenso/lib/utils/teams';
import { type Team } from '@documenso/prisma/client';
import { type tuStreams } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import {
  type TFindTuStreamsInternalResponse,
  type TFindTuStreamsResponse,
  ZFindTuStreamsInternalRequestSchema,
} from '@documenso/trpc/server/tustreams-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@documenso/ui/primitives/dialog';
import FormTuStreams from '@documenso/ui/primitives/form-tustreams';
import { Tabs, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { AdvancedFilterDialog } from '~/components/dialogs/advanced-filte-dialog';
import { ArtistCreateDialog } from '~/components/dialogs/artist-create-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { PeriodSelector } from '~/components/general/period-selector';
import { TuStreamsType } from '~/components/general/task/tustreams-type';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { TableArtistFilter } from '~/components/tables/lpm-table-artist-filter';
import { TuStreamsTable } from '~/components/tables/tustreams-table';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export const ExtendedTuStreamsType = {
  ...TypeOfTuStreams,

  ALL: 'ALL',
} as const;

export type ExtendedTuStreamsType =
  (typeof ExtendedTuStreamsType)[keyof typeof ExtendedTuStreamsType];

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export function meta() {
  return appMetaTags('TuStreams');
}

const ZSearchParamsSchema = ZFindTuStreamsInternalRequestSchema.pick({
  type: true,
  period: true,
  page: true,
  perPage: true,
  query: true,
}).extend({
  artistIds: z.string().transform(parseToIntegerArray).optional().catch([]),
});
export default function TuStreamsPage() {
  const [searchParams] = useSearchParams();

  const findDocumentSearchParams = useMemo(() => {
    const searchParamsObject = Object.fromEntries(searchParams.entries());

    // Add special handling for the 'type' parameter
    if (
      searchParamsObject.type &&
      ['EP', 'Album', 'Sencillo', 'Single', 'ALL'].includes(searchParamsObject.type)
    ) {
      // Ensure the type exactly matches one of the valid enum values
      // This handles any case sensitivity issues
      // searchParamsObject.type = searchParamsObject.type;
    }

    const result = ZSearchParamsSchema.safeParse(searchParamsObject);

    if (!result.success) {
      // Return a default object with manually extracted values from URL
      return {
        type: ['EP', 'Album', 'Sencillo', 'Single', 'ALL'].includes(searchParamsObject.type)
          ? (searchParamsObject.type as ExtendedTuStreamsType)
          : undefined,
        period: searchParamsObject.period as '7d' | '14d' | '30d',
        page: searchParamsObject.page ? Number(searchParamsObject.page) : undefined,
        perPage: searchParamsObject.perPage ? Number(searchParamsObject.perPage) : undefined,
        query: searchParamsObject.query,
      };
    }

    return result.data;
  }, [searchParams]);

  // const findDocumentSearchParams = useMemo(
  //   () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
  //   [searchParams],
  // );

  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const releasesRootPath = formTuStreamsPath(team?.url);

  const { data, isLoading, isLoadingError, refetch } = trpc.tuStreams.findTuStreams.useQuery({
    query: findDocumentSearchParams.query,
    type: findDocumentSearchParams.type,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
    artistIds: findDocumentSearchParams.artistIds,
  });

  const { data: artistData, isLoading: artistDataloading } =
    trpc.tuStreams.findTuStreamsUniqueArtists.useQuery();

  const { data: allArtistData, isLoading: artistLoading } = trpc.tuStreams.findArtists.useQuery();

  const createManyTuStreamsMutation = trpc.tuStreams.createManyTuStreams.useMutation();

  const createMutation = trpc.tuStreams.createTuStreams.useMutation();
  const updateMutation = trpc.tuStreams.updateTuStreams.useMutation();
  const deleteMutation = trpc.tuStreams.deleteTuStreams.useMutation();
  const deleteMultipleMutation = trpc.tuStreams.deleteMultipleByIds.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dataIntial, setData] = useState<TFindTuStreamsResponse | null>(null);
  const [editingUser, setEditingUser] = useState<TtuStreams | null>(null);
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);

  const [type, setType] = useState<TFindTuStreamsInternalResponse['type']>({
    [ExtendedTuStreamsType.Album]: 0,
    [ExtendedTuStreamsType.EP]: 0,
    [ExtendedTuStreamsType.Single]: 0,
    [ExtendedTuStreamsType.Sencillo]: 0,
    [ExtendedTuStreamsType.ALL]: 0,
  });

  useEffect(() => {
    if (data?.tuStreams) {
      setData(data.tuStreams);
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
      // No need to normalize to lowercase since we have both cases in the mapping
      const normalizedInput = dateString.trim();

      // Match patterns like "24 de abril", "24 abril", "24 de Abril", etc.
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
        const parsedDate = parseSpanishDate(item['Fecha'] || item['Date'] || '');

        // Validate type to ensure it's one of the allowed TypeOfTuStreams values
        let type: 'EP' | 'Album' | 'Sencillo' | undefined = undefined;
        const typeValue = item['Tipo'] || item['Type'] || item['Tipo de Release'];
        if (typeValue === 'EP' || typeValue === 'Album' || typeValue === 'Sencillo') {
          type = typeValue as 'EP' | 'Album' | 'Sencillo';
        }

        // Parse total as float
        const parseTotal = (value: string | undefined): number | undefined => {
          if (!value) return undefined;
          const parsed = parseFloat(value.replace(',', '.'));
          return isNaN(parsed) ? undefined : parsed;
        };

        return {
          title: item['Titulo'] || item['Title'] || item['Lanzamiento'] || undefined,
          UPC: item['UPC'] || item['Codigo UPC'] || undefined,
          artist: item['Artista'] || item['Artist'] || undefined,
          type,
          total: parseTotal(item['Total'] || item['Monto'] || item['Valor']),
          date: parsedDate || undefined,
        };
      });

      // Filter out completely empty objects (in case there are empty rows in CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== undefined && value !== ''),
      );

      // Use the mutation to create multiple records
      const result = await createManyTuStreamsMutation.mutateAsync({
        tuStreams: filteredData,
      });

      toast({
        description: `Se han creado ${result} registros exitosamente`,
      });

      // Refresh the data
      await refetch();
      setCsvFile(null);
    } catch (error) {
      console.error('Error al procesar el CSV:', error);
      toast({
        variant: 'destructive',
        description: 'Error al procesar el archivo CSV',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (newRecord: Omit<TtuStreams, 'id'>) => {
    try {
      const { id } = await createMutation.mutateAsync({
        title: newRecord.title || undefined,
        UPC: newRecord.UPC || undefined,
        artists: newRecord.tuStreamsArtists || undefined,
        type: newRecord.type || undefined,
        total: newRecord.total || undefined,
        date: newRecord.date || undefined,
      });
      toast({
        description: 'TuStreams record added successfully',
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error adding TuStreams record',
      });
      console.error('Error creating record:', error);
    } finally {
      await refetch();
    }
  };

  const handleUpdate = async (updated: TtuStreams) => {
    try {
      const { id } = await updateMutation.mutateAsync({
        id: updated.id,
        title: updated.title || undefined,
        UPC: updated.UPC || undefined,
        artists: updated.tuStreamsArtists || undefined,
        type: updated.type || undefined,
        total: updated.total || undefined,
        date: updated.date || undefined,
      });

      setEditingUser(null);
      toast({
        description: 'TuStreams record updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error updating TuStreams record',
      });
      console.error('Error updating record:', error);
    } finally {
      await refetch();
    }
  };

  const handleEdit = (record: TFindTuStreamsResponse['data'][number]) => {
    setEditingUser(record as tuStreams);
    setIsDialogOpen(true);
  };

  const handleDelete = async (deleteData: TFindTuStreamsResponse['data'][number]) => {
    try {
      if (dataIntial) {
        await deleteMutation.mutateAsync({ id: deleteData.id });

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

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  const getTabHref = (value: keyof typeof ExtendedTuStreamsType) => {
    const params = new URLSearchParams(searchParams);

    params.set('type', value);

    if (value === ExtendedTuStreamsType.ALL) {
      params.delete('type');
    }

    if (params.has('page')) {
      params.delete('page');
    }

    return `${formTuStreamsPath(team?.url)}?${params.toString()}`;
  };

  const handleTaskClick = (taskId: number) => {
    void navigate(`${releasesRootPath}/${taskId}`);
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
            <FormTuStreams
              // onSubmit={editingUser ? handleUpdate : handleCreate}
              // initialData={editingUser}
              artistData={allArtistData}
              // isSubmitting={isSubmitting}
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
            <Trans>TuStreams</Trans>
          </h1>
        </div>

        <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
          <Tabs value={findDocumentSearchParams.type || 'ALL'} className="overflow-x-auto">
            <TabsList>
              {['Sencillo', 'Single', 'Album', 'EP', 'ALL'].map((value) => {
                return (
                  <TabsTrigger
                    key={value}
                    className="hover:text-foreground min-w-[60px]"
                    value={value}
                    asChild
                  >
                    <Link
                      to={getTabHref(value as keyof typeof ExtendedTuStreamsType)}
                      preventScrollReset
                    >
                      <TuStreamsType type={value as ExtendedTuStreamsType} />

                      {value !== 'ALL' && (
                        <span className="ml-1 inline-block opacity-50">
                          {type[value as ExtendedTuStreamsType]}
                        </span>
                      )}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <PeriodSelector />
          </div>
          <TableArtistFilter artistData={artistData} isLoading={artistDataloading} />

          {/* <div className="mb-4 flex items-center gap-2">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Cargar CSV'}
            </Button>
          </div> */}
          <div className="flex w-48 flex-wrap items-center justify-between">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
          <div className="flex w-fit flex-wrap items-center justify-between">
            <Button onClick={openCreateDialog}>Create TuStream</Button>
          </div>

          <AdvancedFilterDialog tableToConsult="TuStreams" />

          <ArtistCreateDialog />

          {/* <div className="flex w-auto flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <Button
              onClick={handleConvertDates}
              variant="outline"
              disabled={convertDatesMutation.isLoading}
            >
              {convertDatesMutation.isLoading ? 'Converting...' : 'Convert Date Formats'}
            </Button>
          </div> */}
        </div>

        <div className="mt w-full">
          {data && (!data?.tuStreams.data.length || data?.tuStreams.data.length === 0) ? (
            <GeneralTableEmptyState status={'ALL'} />
          ) : (
            // <p>sin data</p>
            <TuStreamsTable
              onMultipleDelete={handleMultipleDelete}
              isMultipleDelete={isMultipleDelete}
              setIsMultipleDelete={setIsMultipleDelete}
              data={data?.tuStreams}
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
