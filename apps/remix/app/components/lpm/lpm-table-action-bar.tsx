// import { type Task, tasks } from "@/db/schema";
import * as React from 'react';

import { TeamMemberRole } from '@prisma/client';
import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';
import { toast as sonnertoast } from 'sonner';
import { match } from 'ts-pattern';

import { trpc } from '@documenso/trpc/react';
import type { TFindLpmResponse } from '@documenso/trpc/server/lpm-router/schema';
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
type TableRow = TFindLpmResponse['data'][number];

interface TableActionBarProps {
  table: Table<TableRow>;
  currentTeamMemberRole?: TeamMemberRole;
}

export function LpmTableActionBar({ table, currentTeamMemberRole }: TableActionBarProps) {
  const { toast } = useToast();
  const canEditDelete = match(currentTeamMemberRole)
    .with(TeamMemberRole.ADMIN, () => true)
    .with(TeamMemberRole.MANAGER, () => true)
    .with(TeamMemberRole.MEMBER, () => false)
    .otherwise(() => true);
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const deleteMultipleContractsMutation = trpc.lpm.deleteMultipleByIds.useMutation();
  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  const handleMultipleDelete = () => {
    setCurrentAction('delete');
    try {
      const ids = rows.map((row) => row.original.id);
      startTransition(async () => {
        await deleteMultipleContractsMutation.mutateAsync({ ids: ids });

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

  // const onTaskDelete = React.useCallback(() => {
  //   setCurrentAction("delete");
  //   startTransition(async () => {
  //     const { error } = await deleteTasks({
  //       ids: rows.map((row) => row.original.id),
  //     });

  //     if (error) {
  //       toast({
  //         description: `${error} `,
  //         variant: "destructive",
  //       });
  //       return;
  //     }
  //     table.toggleAllRowsSelected(false);
  //   });
  // }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        {canEditDelete && (
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
        )}

        <DataTableActionBarAction
          size="icon"
          tooltip="Export"
          isPending={isPending || currentAction === 'export' || currentAction === 'delete'}
          onClick={onTaskExport}
        >
          <Download />
        </DataTableActionBarAction>
        {/* <DataTableActionBarAction
          size="icon"
          tooltip="Delete"
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
        >
          <Trash2 />
        </DataTableActionBarAction> */}
      </div>
    </DataTableActionBar>
  );
}
