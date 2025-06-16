// import { type Task, tasks } from "@/db/schema";
import * as React from 'react';

import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';
import { toast as sonnertoast } from 'sonner';

import { trpc } from '@documenso/trpc/react';
import type { TFindIsrcSongsResponse } from '@documenso/trpc/server/isrcsong-router/schema';
import { exportTableToCSV } from '@documenso/ui/lib/export';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from '@documenso/ui/primitives/data-table-action-bar';
import { Separator } from '@documenso/ui/primitives/separator';
import { useToast } from '@documenso/ui/primitives/use-toast';

const actions = ['update-status', 'update-priority', 'export', 'delete'] as const;

type Action = (typeof actions)[number];
type TableRow = TFindIsrcSongsResponse['data'][number];

interface TableActionBarProps {
  table: Table<TableRow>;
}

export function TableActionBar({ table }: TableActionBarProps) {
  const { toast } = useToast();
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const deleteMultipleMutation = trpc.distribution.deleteMultipleByIds.useMutation();
  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  const handleMultipleDelete = () => {
    setCurrentAction('delete');
    try {
      const ids = rows.map((row) => row.original.id);
      console.log('Deleting IDs:', ids);
      startTransition(async () => {
        await deleteMultipleMutation.mutateAsync({ ids: ids });

        toast({
          description: `${ids.length} deleted successfully`,
        });
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting data',
      });
      console.error('Error deleting record:', error);
    }
  };

  const onTaskExport = React.useCallback(() => {
    setCurrentAction('export');
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: true,
      });
    });
  }, [table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <DataTableActionBarAction
          size="icon"
          tooltip="Delete"
          isPending={isPending || currentAction === 'delete'}
          onClick={() => {
            sonnertoast.warning('Esta acción sera permanente', {
              description: 'Estas seguro que quieres eliminar este elemento?',
              action: {
                label: 'Eliminar',
                onClick: () => handleMultipleDelete(),
              },
            });
          }}
        >
          <Trash2 />
        </DataTableActionBarAction>

        <DataTableActionBarAction
          size="icon"
          tooltip="Export"
          isPending={isPending || currentAction === 'delete' || currentAction === 'export'}
          onClick={onTaskExport}
        >
          <Download />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
