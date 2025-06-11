import { useTransition } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader } from 'lucide-react';
import { DateTime } from 'luxon';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import type { TFindDistributionInternalResponse } from '@documenso/trpc/server/distributionStatement-router/schema';
import { Checkbox } from '@documenso/ui/primitives/checkbox';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';

import { useOptionalCurrentTeam } from '~/providers/team';

import { DataTableSkeleton } from './data-table-skeleton';

export type DocumentsTableProps = {
  data?: TFindDistributionInternalResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onMoveDocument?: (documentId: number) => void;
  onAdd: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
};

interface DataTableProps<TData, TValue> {
  data?: TFindDistributionInternalResponse;
  isLoading?: boolean;
  isLoadingError?: boolean;
  onMoveDocument?: (documentId: number) => void;

  onAdd?: () => void;
  onEdit?: (data: DocumentsTableRow) => void;
  onDelete?: (data: DocumentsTableRow) => void;
  onMultipleDelete: (ids: number[]) => void;
  isMultipleDelete?: boolean;
  setIsMultipleDelete?: (value: boolean) => void;
}

type DocumentsTableRow = TFindDistributionInternalResponse['data'][number];

export const DistributionTable = ({
  data,
  isLoading,
  isLoadingError,
  onMoveDocument,
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
        header: _(msg`ID`),
        accessorKey: 'id',
        cell: ({ row }) => row.original.id,
      },
      {
        header: _(msg`Marketing Owner`),
        accessorKey: 'marketingOwner',
        cell: ({ row }) => row.original.marketingOwner || '-',
      },
      {
        header: _(msg`Nombre Distribución`),
        accessorKey: 'nombreDistribucion',
        cell: ({ row }) => row.original.nombreDistribucion || '-',
      },
      {
        header: _(msg`Proyecto`),
        accessorKey: 'proyecto',
        cell: ({ row }) => row.original.proyecto || '-',
      },
      {
        header: _(msg`Número de Catálogo`),
        accessorKey: 'numeroDeCatalogo',
        cell: ({ row }) => row.original.numeroDeCatalogo || '-',
      },
      {
        header: _(msg`UPC`),
        accessorKey: 'upc',
        cell: ({ row }) => row.original.upc || '-',
      },
      {
        header: _(msg`Local Product Number`),
        accessorKey: 'localProductNumber',
        cell: ({ row }) => row.original.localProductNumber || '-',
      },
      {
        header: _(msg`ISRC`),
        accessorKey: 'isrc',
        cell: ({ row }) => row.original.isrc || '-',
      },
      {
        header: _(msg`Título Catálogo`),
        accessorKey: 'tituloCatalogo',
        cell: ({ row }) => row.original.tituloCatalogo || '-',
      },
      {
        header: _(msg`Mes Reportado`),
        accessorKey: 'mesReportado',
        cell: ({ row }) => (row.original.mesReportado ? String(row.original.mesReportado) : '-'),
      },
      {
        header: _(msg`Territorio`),
        accessorKey: 'distributionStatementMusicPlatforms',
        cell: ({ row }) => {
          const platforms = row.original.distributionStatementMusicPlatforms;
          if (!platforms || platforms.length === 0) return '-';

          // If you want to display all platform names, join them with commas
          return platforms[0]?.name;

          // Or if you want to display just the first platform name:
          // return platforms[0]?.name || '-';
        },
      },
      {
        header: _(msg`Código del Territorio`),
        accessorKey: 'codigoDelTerritorio',
        cell: ({ row }) => row.original.codigoDelTerritorio || '-',
      },

      {
        header: _(msg`Nombre del Territorio`),
        accessorKey: 'distributionStatementTerritories',
        cell: ({ row }) => {
          const territories = row.original.distributionStatementTerritories;
          if (!territories || territories.length === 0) return '-';

          // If you want to display all platform names, join them with commas
          return territories[0]?.name;

          // Or if you want to display just the first platform name:
          // return platforms[0]?.name || '-';
        },
      },
      {
        header: _(msg`Tipo de Precio`),
        accessorKey: 'tipoDePrecio',
        cell: ({ row }) => row.original.tipoDePrecio || '-',
      },
      {
        header: _(msg`Tipo de Ingreso`),
        accessorKey: 'tipoDeIngreso',
        cell: ({ row }) => row.original.tipoDeIngreso || '-',
      },
      {
        header: _(msg`Venta`),
        accessorKey: 'venta',
        cell: ({ row }) => (row.original.venta !== null ? String(row.original.venta) : '-'),
      },
      {
        header: _(msg`RTL`),
        accessorKey: 'rtl',
        cell: ({ row }) => (row.original.rtl !== null ? row.original.rtl : '-'),
      },
      {
        header: _(msg`PPD`),
        accessorKey: 'ppd',
        cell: ({ row }) => (row.original.ppd !== null ? row.original.ppd : '-'),
      },
      {
        header: _(msg`RBP`),
        accessorKey: 'rbp',
        cell: ({ row }) => (row.original.rbp !== null ? row.original.rbp : '-'),
      },
      {
        header: _(msg`Tipo de Cambio`),
        accessorKey: 'tipoDeCambio',
        cell: ({ row }) => (row.original.tipoDeCambio !== null ? row.original.tipoDeCambio : '-'),
      },
      {
        header: _(msg`Valor Recibido`),
        accessorKey: 'valorRecibido',
        cell: ({ row }) => (row.original.valorRecibido !== null ? row.original.valorRecibido : '-'),
      },
      {
        header: _(msg`Regalías Artísticas`),
        accessorKey: 'regaliasArtisticas',
        cell: ({ row }) =>
          row.original.regaliasArtisticas !== null ? String(row.original.regaliasArtisticas) : '-',
      },
      {
        header: _(msg`Costo Distribución`),
        accessorKey: 'costoDistribucion',
        cell: ({ row }) =>
          row.original.costoDistribucion !== null ? row.original.costoDistribucion : '-',
      },
      {
        header: _(msg`Copyright`),
        accessorKey: 'copyright',
        cell: ({ row }) => (row.original.copyright !== null ? String(row.original.copyright) : '-'),
      },
      {
        header: _(msg`Cuota Administración`),
        accessorKey: 'cuotaAdministracion',
        cell: ({ row }) =>
          row.original.cuotaAdministracion !== null
            ? String(row.original.cuotaAdministracion)
            : '-',
      },
      {
        header: _(msg`Costo Carga`),
        accessorKey: 'costoCarga',
        cell: ({ row }) =>
          row.original.costoCarga !== null ? String(row.original.costoCarga) : '-',
      },
      {
        header: _(msg`Otros Costos`),
        accessorKey: 'otrosCostos',
        cell: ({ row }) =>
          row.original.otrosCostos !== null ? String(row.original.otrosCostos) : '-',
      },
      {
        header: _(msg`Ingresos Recibidos`),
        accessorKey: 'ingresosRecibidos',
        cell: ({ row }) =>
          row.original.ingresosRecibidos !== null ? row.original.ingresosRecibidos : '-',
      },
      {
        header: _(msg`Fecha de Creación`),
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          i18n.date(row.original.createdAt, { ...DateTime.DATETIME_SHORT, hourCycle: 'h12' }),
      },
      {
        header: _(msg`Última Actualización`),
        accessorKey: 'updatedAt',
        cell: ({ row }) =>
          i18n.date(row.original.updatedAt, { ...DateTime.DATETIME_SHORT, hourCycle: 'h12' }),
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
        columns={columns}
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
