import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { Bird, HomeIcon, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Link } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import type { findTasks } from '@documenso/lib/server-only/task/find-task';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formTasksPath } from '@documenso/lib/utils/teams';
import { type Team } from '@documenso/prisma/client';
import { ExtendedTaskPriority } from '@documenso/prisma/types/extended-task-priority';
import { trpc } from '@documenso/trpc/react';
import {
  type TFindTaskInternalResponse,
  ZFindTasksInternalRequestSchema,
} from '@documenso/trpc/server/document-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { Tabs, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';

import { TaskCreateDialog } from '~/components/dialogs/task-create-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { PeriodSelector } from '~/components/general/period-selector';
import { TaskPriority } from '~/components/general/task/task-priority';
import { TasksTable } from '~/components/general/task/tasks-list';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export type TasksPageViewProps = {
  team?: Team;
  initialTasks: Awaited<ReturnType<typeof findTasks>>;
};

export function meta() {
  return appMetaTags('Tasks');
}

const ZSearchParamsSchema = ZFindTasksInternalRequestSchema.pick({
  priority: true,
  period: true,
  page: true,
  perPage: true,
  query: true,
});

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  console.log('findDocumentSearchParams', findDocumentSearchParams);
  const navigate = useNavigate();
  const team = useOptionalCurrentTeam();
  const taskRootPath = formTasksPath(team?.url);
  const { user } = useSession();
  const { data, isLoading, isLoadingError, refetch } = trpc.task.findTasks.useQuery({
    query: findDocumentSearchParams.query,
    priority: findDocumentSearchParams.priority,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
  });

  const [stats, setStats] = useState<TFindTaskInternalResponse['stats']>({
    [ExtendedTaskPriority.LOW]: 0,
    [ExtendedTaskPriority.MEDIUM]: 0,
    [ExtendedTaskPriority.HIGH]: 0,
    [ExtendedTaskPriority.CRITICAL]: 0,
    [ExtendedTaskPriority.ALL]: 0,
  });

  useEffect(() => {
    if (data?.stats) {
      setStats(data.stats);
    }
  }, [data?.stats]);

  useEffect(() => {
    void refetch();
  }, [team?.url]);

  type TeamMember = {
    name: string | null;
    email: string;
  };
  let teamMembers = [] as TeamMember[];
  let isloadingTeamMembers = false;
  let isLoadingErrorTeamMembers = false;
  if (team) {
    const { data, isLoading, isLoadingError } = trpc.team.findTeamMembersLimited.useQuery({
      teamId: team.id,
    });
    isloadingTeamMembers = isLoading;
    isLoadingErrorTeamMembers = isLoadingError;
    teamMembers = data?.data || [];
  }

  const getTabHref = (value: keyof typeof ExtendedTaskPriority) => {
    const params = new URLSearchParams(searchParams);

    params.set('priority', value);

    if (value === ExtendedTaskPriority.ALL) {
      params.delete('priority');
    }

    if (params.has('page')) {
      params.delete('page');
    }

    return `${formTasksPath(team?.url)}?${params.toString()}`;
  };

  const handleTaskClick = (taskId: number) => {
    void navigate(`${taskRootPath}/${taskId}`);
  };

  return (
    <div className="mx-auto max-w-screen-xl gap-y-8 px-4 md:px-8">
      {/* <CardsChat /> */}
      {/* <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 pl-0 hover:bg-transparent"
            onClick={async () => await navigate(taskRootPath)}
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </div>

        <div className="flex gap-4 sm:flex-row sm:justify-end">
          <TaskCreateDialog
            teamMembers={teamMembers}
            isLoading={isloadingTeamMembers}
            taskRootPath={taskRootPath}
          />
        </div>
      </div> */}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
        <div className="flex w-full flex-row items-center">
          {team && (
            <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
              {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
              <AvatarFallback className="text-muted-foreground text-xs">
                {team.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <h1 className="w-40 truncate text-2xl font-semibold md:text-3xl">
            <Trans>Tareas</Trans>
          </h1>

          <div className="flex w-full gap-4 sm:flex-row sm:justify-end">
            <TaskCreateDialog
              teamMembers={teamMembers}
              isLoading={isloadingTeamMembers}
              taskRootPath={taskRootPath}
            />
          </div>
        </div>

        <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
          <Tabs value={findDocumentSearchParams.priority || 'ALL'} className="overflow-x-auto">
            <TabsList>
              {[
                ExtendedTaskPriority.LOW,
                ExtendedTaskPriority.MEDIUM,
                ExtendedTaskPriority.HIGH,
                ExtendedTaskPriority.CRITICAL,
                ExtendedTaskPriority.ALL,
              ].map((value) => (
                <TabsTrigger
                  key={value}
                  className="hover:text-foreground min-w-[60px]"
                  value={value}
                  asChild
                >
                  <Link to={getTabHref(value)} preventScrollReset>
                    <TaskPriority priority={value} />

                    {value !== ExtendedTaskPriority.ALL && (
                      <span className="ml-1 inline-block opacity-50">{stats[value]}</span>
                    )}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <PeriodSelector />
          </div>
          <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
            <DocumentSearch initialValue={findDocumentSearchParams.query} />
          </div>
        </div>

        <div className="mt-8 w-full">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : isLoadingError ? (
            <div className="flex h-64 items-center justify-center text-red-500">
              <Trans>Error al cargar las tareas</Trans>
            </div>
          ) : data && data.tasks.length === 0 ? (
            <div className="text-muted-foreground/60 flex h-96 flex-col items-center justify-center gap-y-4">
              <Bird className="h-12 w-12" strokeWidth={1.5} />

              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  <Trans>No hay tareas</Trans>
                </h3>

                <p className="mt-2 max-w-[50ch]">
                  <Trans>
                    No has creado ninguna tarea todavía. Crea una nueva tarea para comenzar.
                  </Trans>
                </p>
              </div>
            </div>
          ) : (
            <TasksTable
              tasks={(data?.tasks || [])
                // .filter(
                //   (task): task is { status: 'PENDING' | 'COMPLETED' } & typeof task =>
                //     task.status === 'PENDING' || task.status === 'COMPLETED',
                // )
                .map((task) => ({
                  ...task,
                  priority: task.priority === 'CRITICAL' ? 'HIGH' : task.priority,
                  assignees: task.assignees.map((assignee) => ({
                    name: `User ${assignee.userId}`, // Replace with actual logic to get the name
                  })),
                }))}
              isLoading={false} // Ya manejamos el loading arriba
              isLoadingError={false} // Ya manejamos el error arriba
              onTaskClick={handleTaskClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
