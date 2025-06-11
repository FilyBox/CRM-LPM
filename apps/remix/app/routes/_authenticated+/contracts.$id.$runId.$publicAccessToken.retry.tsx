import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { DocumentStatus, TeamMemberRole } from '@prisma/client';
import { ChevronLeft } from 'lucide-react';
import { Link, redirect } from 'react-router';
import { useNavigate } from 'react-router';
import { match } from 'ts-pattern';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { getContractById } from '@documenso/lib/server-only/document/get-contract-by-id';
import { getDocumentById } from '@documenso/lib/server-only/document/get-document-by-id';
import { getFieldsForDocument } from '@documenso/lib/server-only/field/get-fields-for-document';
import { getRecipientsForDocument } from '@documenso/lib/server-only/recipient/get-recipients-for-document';
import { type TGetTeamByUrlResponse, getTeamByUrl } from '@documenso/lib/server-only/team/get-team';
import { DocumentVisibility } from '@documenso/lib/types/document-visibility';
import { formatContractsPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import Component from '@documenso/ui/components/ai-card/ai-generation-card-regenerate';
import { Card, CardContent } from '@documenso/ui/primitives/card';

import { TriggerProvider } from '~/components/general/document/TriggerProvider';
import { DocumentRecipientLinkCopyDialog } from '~/components/general/document/document-recipient-link-copy-dialog';
import { superLoaderJson, useSuperLoaderData } from '~/utils/super-json-loader';

import type { Route } from './+types/documents.$id._index';

export async function loader({ params, request }: Route.LoaderArgs) {
  const { user } = await getSession(request);

  let team: TGetTeamByUrlResponse | null = null;

  if (params.teamUrl) {
    team = await getTeamByUrl({ userId: user.id, teamUrl: params.teamUrl });
  }

  const { id, publicAccessToken, runId } = params;

  const documentId = Number(id);

  const documentRootPath = formatContractsPath(team?.url);

  const contract = await getContractById({
    documentId,
    userId: user.id,
    teamId: team?.id,
  }).catch(() => null);

  if (!contract) {
    ('no contract found');
    throw redirect(documentRootPath);
  }

  if (!runId) {
    console.error('No runId provided');
    throw redirect(documentRootPath);
  }

  if (!publicAccessToken) {
    console.error('No public access token provided');
    throw redirect(documentRootPath);
  }

  if (!documentId || Number.isNaN(documentId)) {
    throw redirect(documentRootPath);
  }

  const document = await getDocumentById({
    documentId,
    userId: user.id,
    teamId: team?.id,
  }).catch(() => null);
  if (document?.teamId && !team?.url) {
    throw redirect(documentRootPath);
  }

  if (document?.folderId) {
    throw redirect(documentRootPath);
  }

  const documentVisibility = document?.visibility;
  const currentTeamMemberRole = team?.currentTeamMember?.role;
  const isRecipient = document?.recipients.find((recipient) => recipient.email === user.email);
  let canAccessDocument = true;

  if (team && !isRecipient && document?.userId !== user.id) {
    canAccessDocument = match([documentVisibility, currentTeamMemberRole])
      .with([DocumentVisibility.EVERYONE, TeamMemberRole.ADMIN], () => true)
      .with([DocumentVisibility.EVERYONE, TeamMemberRole.MANAGER], () => true)
      .with([DocumentVisibility.EVERYONE, TeamMemberRole.MEMBER], () => true)
      .with([DocumentVisibility.MANAGER_AND_ABOVE, TeamMemberRole.ADMIN], () => true)
      .with([DocumentVisibility.MANAGER_AND_ABOVE, TeamMemberRole.MANAGER], () => true)
      .with([DocumentVisibility.ADMIN, TeamMemberRole.ADMIN], () => true)
      .otherwise(() => false);
  }

  if (!document || !document.documentData || (team && !canAccessDocument)) {
    throw redirect(documentRootPath);
  }

  if (team && !canAccessDocument) {
    throw redirect(documentRootPath);
  }

  // Todo: Get full document instead?
  const [recipients, fields] = await Promise.all([
    getRecipientsForDocument({
      documentId,
      teamId: team?.id,
      userId: user.id,
    }),
    getFieldsForDocument({
      documentId,
      userId: user.id,
      teamId: team?.id,
    }),
  ]);

  const documentWithRecipients = {
    ...document,
    recipients,
  };

  return superLoaderJson({
    document: documentWithRecipients,
    documentRootPath,
    fields,
    contract,
    runId,
    publicAccessToken,
  });
}

export default function DocumentPage() {
  const loaderData = useSuperLoaderData<typeof loader>();
  const navigate = useNavigate();

  const { _ } = useLingui();
  const { user } = useSession();

  const { document, documentRootPath, fields, contract, publicAccessToken, runId } = loaderData;
  const { recipients, documentData, documentMeta } = document;
  const retryDocument = trpc.document.retryContractData.useMutation();

  // This was a feature flag. Leave to false since it's not ready.
  const isDocumentHistoryEnabled = false;
  const handleRetry = async () => {
    try {
      const { publicAccessToken, id } = await retryDocument.mutateAsync({
        documentId: contract.documentId,
      });

      void navigate(`${documentRootPath}/${contract.documentId}/${id}/${publicAccessToken}/retry`);
    } catch (error) {
      console.error('Error navigating to folders:', error);
    }
  };
  return (
    <div className="relative mx-auto -mt-4 w-full max-w-screen-xl px-4 md:px-8">
      {document.status === DocumentStatus.PENDING && (
        <DocumentRecipientLinkCopyDialog recipients={recipients} />
      )}

      <Link to={documentRootPath} className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        <Trans>Contracts</Trans>
      </Link>

      {/* <div className="flex flex-row justify-between truncate">
        <div>
          <h1
            className="mt-4 block max-w-[20rem] truncate text-2xl font-semibold md:max-w-[30rem] md:text-3xl"
            title={document.title}
          >
            {document.title}
          </h1>
          
        </div>
      </div> */}
      <div className="relative mt-6 grid w-full grid-cols-12 gap-8">
        <Card
          className="col-span-12 rounded-xl before:rounded-xl lg:col-span-6 xl:col-span-7"
          gradient
        >
          <CardContent className="p-2">
            {/* <PDFViewer document={document} key={documentData.id} documentData={documentData} /> */}
          </CardContent>
        </Card>

        <div className="col-span-12 lg:fixed lg:right-8 lg:top-20 lg:col-span-6 xl:col-span-5">
          <TriggerProvider accessToken={publicAccessToken}>
            {contract && (
              <Component
                key={runId}
                publicAccessToken={publicAccessToken}
                runId={runId}
                handleRetry={handleRetry}
                documentRootPath={documentRootPath}
                contract={contract}
              />
            )}
          </TriggerProvider>
        </div>
      </div>
    </div>
  );
}
