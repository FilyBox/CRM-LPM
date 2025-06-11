import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { type TDistribution } from '@documenso/lib/types/distribution';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { parseCsvFile } from '@documenso/lib/utils/csvParser';
import { parseToIntegerArray } from '@documenso/lib/utils/params';
import { formReleasePath } from '@documenso/lib/utils/teams';
import { type DistributionStatement } from '@documenso/prisma/client';
import { type Team } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { ZFindDistributionInternalRequestSchema } from '@documenso/trpc/server/distributionStatement-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { Dialog, DialogContent } from '@documenso/ui/primitives/dialog';
import DistributionForm from '@documenso/ui/primitives/form-distribution';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { AdvancedFilterDialog } from '~/components/dialogs/advanced-filte-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { PeriodSelector } from '~/components/general/period-selector';
import { DistributionTable } from '~/components/tables/distribution-table';
import { TablePlatformFilter } from '~/components/tables/distribution-table-musicplatform-filter';
import { TableTerritoryFilter } from '~/components/tables/distribution-table-territoriesName-filter';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export function meta() {
  return appMetaTags('distribution');
}

const ZSearchParamsSchema = ZFindDistributionInternalRequestSchema.pick({
  period: true,
  page: true,
  perPage: true,
  query: true,
}).extend({
  platformIds: z.string().transform(parseToIntegerArray).optional().catch([]),
  territoryIds: z.string().transform(parseToIntegerArray).optional().catch([]),
});

export default function DistributionPage() {
  const [searchParams] = useSearchParams();
  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const { toast } = useToast();

  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const releasesRootPath = formReleasePath(team?.url);
  const { data, isLoading, isLoadingError, refetch } = trpc.distribution.findDistribution.useQuery({
    query: findDocumentSearchParams.query,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
    platformIds: findDocumentSearchParams.platformIds,
    territoryIds: findDocumentSearchParams.territoryIds,
  });

  const { data: territoryData, isLoading: territoryLoading } =
    trpc.distribution.findDistributionUniqueTerritories.useQuery();

  const { data: platformData, isLoading: platformLoading } =
    trpc.distribution.findDistributionUniquePlatform.useQuery();

  const createManyDistributionMutation = trpc.distribution.createManyDistribution.useMutation();
  const createDistributionMutation = trpc.distribution.createDistribution.useMutation();
  const updateDistributionByIdMutation = trpc.distribution.updateDistributionById.useMutation();
  const deleteDistributionByIdMutation = trpc.distribution.deleteDistributionById.useMutation();
  const deleteMultipleMutation = trpc.distribution.deleteMultipleByIds.useMutation();

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dataIntial, setData] = useState<DistributionStatement[]>([]);
  const [editingUser, setEditingUser] = useState<TDistribution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };
  // useEffect(() => {
  //   if (data?.type) {
  //     setType(data.type);
  //   }
  // }, [data?.type]);

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  type TeamMember = {
    name: string | null;
    email: string;
  };
  const teamMembers = [] as TeamMember[];
  const isloadingTeamMembers = false;
  const isLoadingErrorTeamMembers = false;

  const handleCreate = async (newRecord: Omit<TDistribution, 'id'>) => {
    console.log('New Record:', newRecord);

    setIsSubmitting(true);
    try {
      const { id } = await createDistributionMutation.mutateAsync({
        // Territory and platform arrays
        territories: newRecord.distributionStatementTerritories ?? undefined,
        musicPlatform: newRecord.distributionStatementMusicPlatforms ?? undefined,

        // String fields
        marketingOwner: newRecord.marketingOwner ?? undefined,
        nombreDistribucion: newRecord.nombreDistribucion ?? undefined,
        proyecto: newRecord.proyecto ?? undefined,
        numeroDeCatalogo: newRecord.numeroDeCatalogo ?? undefined,
        upc: newRecord.upc ?? undefined,
        localProductNumber: newRecord.localProductNumber ?? undefined,
        isrc: newRecord.isrc ?? undefined,
        tituloCatalogo: newRecord.tituloCatalogo ?? undefined,
        territorio: newRecord.territorio ?? undefined,
        codigoDelTerritorio: newRecord.codigoDelTerritorio ?? undefined,
        nombreDelTerritorio: newRecord.nombreDelTerritorio ?? undefined,
        tipoDePrecio: newRecord.tipoDePrecio ?? undefined,
        tipoDeIngreso: newRecord.tipoDeIngreso ?? undefined,

        // Numeric fields
        mesReportado: newRecord.mesReportado ?? undefined,
        venta: newRecord.venta ?? undefined,
        rtl: newRecord.rtl ?? undefined,
        ppd: newRecord.ppd ?? undefined,
        rbp: newRecord.rbp ?? undefined,
        tipoDeCambio: newRecord.tipoDeCambio ?? undefined,
        valorRecibido: newRecord.valorRecibido ?? undefined,
        regaliasArtisticas: newRecord.regaliasArtisticas ?? undefined,
        costoDistribucion: newRecord.costoDistribucion ?? undefined,
        copyright: newRecord.copyright ?? undefined,
        cuotaAdministracion: newRecord.cuotaAdministracion ?? undefined,
        costoCarga: newRecord.costoCarga ?? undefined,
        otrosCostos: newRecord.otrosCostos ?? undefined,
        ingresosRecibidos: newRecord.ingresosRecibidos ?? undefined,
      });

      console.log('Created Record ID:', id);
      await refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record: TDistribution) => {
    setEditingUser(record);
    setIsDialogOpen(true);
  };
  const handleDelete = async (deleteData: DistributionStatement) => {
    try {
      setData(dataIntial.filter((record) => record.id !== deleteData.id));
      await deleteDistributionByIdMutation.mutateAsync({ id: deleteData.id });

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

  const handleUpdate = async (updatedDistribution: TDistribution) => {
    console.log('Updated Distribution:', updatedDistribution);
    console.log('id', updatedDistribution.id);
    try {
      const { id } = await updateDistributionByIdMutation.mutateAsync({
        id: updatedDistribution.id,

        // Territory and platform arrays
        territories: updatedDistribution.distributionStatementTerritories ?? undefined,
        musicPlatform: updatedDistribution.distributionStatementMusicPlatforms ?? undefined,

        // String fields
        marketingOwner: updatedDistribution.marketingOwner ?? undefined,
        nombreDistribucion: updatedDistribution.nombreDistribucion ?? undefined,
        proyecto: updatedDistribution.proyecto ?? undefined,
        numeroDeCatalogo: updatedDistribution.numeroDeCatalogo ?? undefined,
        upc: updatedDistribution.upc ?? undefined,
        localProductNumber: updatedDistribution.localProductNumber ?? undefined,
        isrc: updatedDistribution.isrc ?? undefined,
        tituloCatalogo: updatedDistribution.tituloCatalogo ?? undefined,
        territorio: updatedDistribution.territorio ?? undefined,
        codigoDelTerritorio: updatedDistribution.codigoDelTerritorio ?? undefined,
        nombreDelTerritorio: updatedDistribution.nombreDelTerritorio ?? undefined,
        tipoDePrecio: updatedDistribution.tipoDePrecio ?? undefined,
        tipoDeIngreso: updatedDistribution.tipoDeIngreso ?? undefined,

        // Numeric fields
        mesReportado: updatedDistribution.mesReportado ?? undefined,
        venta: updatedDistribution.venta ?? undefined,
        rtl: updatedDistribution.rtl ?? undefined,
        ppd: updatedDistribution.ppd ?? undefined,
        rbp: updatedDistribution.rbp ?? undefined,
        tipoDeCambio: updatedDistribution.tipoDeCambio ?? undefined,
        valorRecibido: updatedDistribution.valorRecibido ?? undefined,
        regaliasArtisticas: updatedDistribution.regaliasArtisticas ?? undefined,
        costoDistribucion: updatedDistribution.costoDistribucion ?? undefined,
        copyright: updatedDistribution.copyright ?? undefined,
        cuotaAdministracion: updatedDistribution.cuotaAdministracion ?? undefined,
        costoCarga: updatedDistribution.costoCarga ?? undefined,
        otrosCostos: updatedDistribution.otrosCostos ?? undefined,
        ingresosRecibidos: updatedDistribution.ingresosRecibidos ?? undefined,
      });

      console.log('Updated Record ID:', id);

      setData(
        dataIntial.map((record) =>
          record.id === updatedDistribution.id ? updatedDistribution : record,
        ),
      );
      // setIsDialogOpen(false);
      // setEditingUser(null);
      await refetch();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

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
        console.log('CSV Item:', item);
        console.log('item nombre del territorio:', item['Nombre del Territorio']);
        // Convert string values to number for numeric fields
        const convertToNumber = (value: string | undefined): number | undefined => {
          if (value === undefined || value === '') return undefined;
          const num = parseFloat(value.replace(',', '.'));
          return isNaN(num) ? undefined : num;
        };

        return {
          // id: item['id'] || undefined,
          marketingOwner: item['Marketing Owner'] || undefined,
          nombreDistribucion: item['Nombre Distribucion'] || undefined,
          proyecto: item['Projecto'] || undefined,
          numeroDeCatalogo: item['Numero de Catalogo'],
          upc: item['UPC'] || undefined,
          localProductNumber: item['Local Product Number'] || undefined,
          isrc: item['ISRC'] || undefined,
          tituloCatalogo: item['Titulo catalogo'] || undefined,
          mesReportado: convertToNumber(item['Mes Reportado']),
          territorio: item['Territorio'] || undefined,
          codigoDelTerritorio: item['Codigo del Territorio'],
          nombreDelTerritorio: item['Nombre del Territorio'],
          tipoDePrecio: item['Tipo de Precio'],
          tipoDeIngreso: item['Tipo de Ingreso'],
          venta: convertToNumber(item['Venta']),
          rtl: convertToNumber(item['RTL']),
          ppd: convertToNumber(item['PPD']),
          rbp: convertToNumber(item['RBP']),
          tipoDeCambio: convertToNumber(item['Tipo de Cambio:']),
          valorRecibido: convertToNumber(item['Valor Recibido']),
          regaliasArtisticas: convertToNumber(item['Regalias Artisticas']),
          costoDistribucion: convertToNumber(item['Costo Distribucion']),
          copyright: convertToNumber(item['Copyright']),
          cuotaAdministracion: convertToNumber(item['Cuota Administracion']),
          costoCarga: convertToNumber(item['Costo Carga']),
          otrosCostos: convertToNumber(item['Otros Costos']),
          ingresosRecibidos: convertToNumber(item['Ingresos Recibidos']),
        };
      });
      // Filtrar cualquier objeto que esté completamente vacío (por si hay filas vacías en el CSV)
      const filteredData = validatedData.filter((item) =>
        Object.values(item).some((value) => value !== ''),
      );

      // Usar la mutación para crear múltiples registros
      const result = await createManyDistributionMutation.mutateAsync({
        distributions: filteredData,
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

  const handleTaskClick = (taskId: number) => {
    void navigate(`${releasesRootPath}/${taskId}`);
  };

  return (
    <div className="mx-auto max-w-screen-xl gap-y-8 px-4 md:px-8">
      {/* <CardsChat /> */}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
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
            <Trans>Distribution Statement</Trans>
          </h1>
        </div>

        <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
          <div className="flex items-center gap-x-2">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm" />
            <Button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Cargar CSV'}
            </Button>
          </div>
          <TableTerritoryFilter territoryData={territoryData} isLoading={territoryLoading} />

          <TablePlatformFilter platformData={platformData} isLoading={platformLoading} />

          <PeriodSelector />
          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
          <AdvancedFilterDialog tableToConsult="Distribution" />
          <Button onClick={openCreateDialog}>Add Item</Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <div>
              <DistributionForm
                territoryData={territoryData}
                platformData={platformData}
                isSubmitting={isSubmitting}
                onSubmit={editingUser ? handleUpdate : handleCreate}
                initialData={editingUser}
              />
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt w-full">
          {data && data.count === 0 && (!data?.data.length || data?.data.length === 0) ? (
            <GeneralTableEmptyState status={'ALL'} />
          ) : (
            <DistributionTable
              onMultipleDelete={handleMultipleDelete}
              setIsMultipleDelete={setIsMultipleDelete}
              isMultipleDelete={isMultipleDelete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              data={data}
              isLoading={isLoading}
              isLoadingError={isLoadingError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
