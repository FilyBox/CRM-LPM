import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { FileCheck, FileClock, FileCog } from 'lucide-react';

import { getDocumentStats } from '@documenso/lib/server-only/admin/get-documents-stats';
import { getRecipientsStats } from '@documenso/lib/server-only/admin/get-recipients-stats';
import {
  getUserWithSignedDocumentMonthlyGrowth,
  getUsersCount,
  getUsersWithSubscriptionsCount,
} from '@documenso/lib/server-only/admin/get-users-stats';
import { getSignerConversionMonthly } from '@documenso/lib/server-only/user/get-signer-conversion';
import { trpc } from '@documenso/trpc/react';

import { AdminStatsUsersWithDocumentsChart } from '~/components/general/admin-stats-users-with-documents';
import { ResultsNoChart } from '~/components/general/advance-filters/results-no-chart';
import { CardMetric } from '~/components/general/metric-card';

import type { Route } from './+types/stats';

export async function loader() {
  const [
    usersCount,
    usersWithSubscriptionsCount,
    docStats,
    recipientStats,
    signerConversionMonthly,
    // userWithAtLeastOneDocumentPerMonth,
    // userWithAtLeastOneDocumentSignedPerMonth,
    MONTHLY_USERS_SIGNED,
  ] = await Promise.all([
    getUsersCount(),
    getUsersWithSubscriptionsCount(),
    getDocumentStats(),
    getRecipientsStats(),
    getSignerConversionMonthly(),
    // getUserWithAtLeastOneDocumentPerMonth(),
    // getUserWithAtLeastOneDocumentSignedPerMonth(),
    getUserWithSignedDocumentMonthlyGrowth(),
  ]);

  return {
    usersCount,
    usersWithSubscriptionsCount,
    docStats,
    recipientStats,
    signerConversionMonthly,
    MONTHLY_USERS_SIGNED,
  };
}

export default function AdminStatsPage({ loaderData }: Route.ComponentProps) {
  const { _ } = useLingui();
  const { data, isLoading, isLoadingError, refetch } =
    trpc.contracts.findContractsStatsByCurrentTeam.useQuery();

  const { data: tuStreamsStats, isLoading: isTuStreamsStatsLoading } =
    trpc.tuStreams.findTuStreamsStatsByCurrentTeam.useQuery();

  const {
    usersCount,
    usersWithSubscriptionsCount,
    docStats,
    recipientStats,

    signerConversionMonthly,
    MONTHLY_USERS_SIGNED,
  } = loaderData;

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <h2 className="text-4xl font-semibold">
        <Trans>Team Stats</Trans>
      </h2>

      <div className="mt-16">
        <h3 className="text-3xl font-semibold">
          <Trans>Contracts</Trans>
        </h3>
        <div className="mb-8 mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          <CardMetric
            icon={FileCog}
            title={_(msg`Total Contracts`)}
            value={data?.TOTAL_CONTRACTS || 0}
          />
          <CardMetric
            icon={FileClock}
            title={_(msg`Finalized Contracts`)}
            value={data?.FINALIZADO || 0}
          />
          <CardMetric
            icon={FileCheck}
            title={_(msg`Ongoing Contracts`)}
            value={data?.VIGENTE || 0}
          />
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-3xl font-semibold">
          <Trans>TuStreams</Trans>
        </h3>
        <div className="mb-8 mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
          <CardMetric
            icon={FileCog}
            title={_(msg`Total Rows TuStreams`)}
            value={tuStreamsStats?.TOTAL_TUSTREAMS || 0}
          />
          <CardMetric icon={FileClock} title={_(msg`Total`)} value={tuStreamsStats?.TOTAL || 0} />
          <CardMetric
            icon={FileCheck}
            title={_(msg`Singles`)}
            value={tuStreamsStats?.Single || 0}
          />
          <CardMetric icon={FileCheck} title={_(msg`Albums`)} value={tuStreamsStats?.Album || 0} />
        </div>
      </div>

      <div className="mt-16">
        <ResultsNoChart
          results={tuStreamsStats?.data || []}
          data={tuStreamsStats?.data || []}
          columns={Object.keys(tuStreamsStats?.data[0] || {})}
          isLoading={isTuStreamsStatsLoading}
        />
      </div>

      {/* <div className="mt-16">
        <h3 className="text-3xl font-semibold">
          <Trans>Charts</Trans>
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2">
          <AdminStatsUsersWithDocumentsChart
            data={MONTHLY_USERS_SIGNED}
            title={_(msg`MAU (created document)`)}
            tooltip={_(msg`Monthly Active Users: Users that created at least one Document`)}
          />
          <AdminStatsUsersWithDocumentsChart
            data={MONTHLY_USERS_SIGNED}
            completed
            title={_(msg`MAU (had document completed)`)}
            tooltip={_(
              msg`Monthly Active Users: Users that had at least one of their documents completed`,
            )}
          />
        </div>
      </div> */}
    </div>
  );
}
