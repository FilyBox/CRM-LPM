import { useEffect, useRef, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { DocumentStatus, TeamMemberRole } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, XIcon } from 'lucide-react';
import { Link, redirect } from 'react-router';
import { useNavigate } from 'react-router';
import { match } from 'ts-pattern';
import { useWindowSize } from 'usehooks-ts';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { getContractById } from '@documenso/lib/server-only/document/get-contract-by-id';
import { getDocumentById } from '@documenso/lib/server-only/document/get-document-by-id';
import { getFieldsForDocument } from '@documenso/lib/server-only/field/get-fields-for-document';
import { getRecipientsForDocument } from '@documenso/lib/server-only/recipient/get-recipients-for-document';
import { type TGetTeamByUrlResponse, getTeamByUrl } from '@documenso/lib/server-only/team/get-team';
import { DocumentVisibility } from '@documenso/lib/types/document-visibility';
import { formatContractsPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import Component from '@documenso/ui/components/ai-card/ai-generation-card';
import { Button } from '@documenso/ui/primitives/button';
import { Card, CardContent } from '@documenso/ui/primitives/card';
import PDFViewer from '@documenso/ui/primitives/pdf-viewer';

import { DocumentRecipientLinkCopyDialog } from '~/components/general/document/document-recipient-link-copy-dialog';
import { superLoaderJson, useSuperLoaderData } from '~/utils/super-json-loader';

import type { Route } from './+types/documents.$id._index';

type UIArtifact = {
  title: string;
  documentId: string;
  kind: string;
  content: string;
  isVisible: boolean;
  status: 'streaming' | 'idle';
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export const initialArtifactData: UIArtifact = {
  documentId: 'init',
  content: '',
  kind: 'text',
  title: '',
  status: 'idle',
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const { user } = await getSession(request);

  let team: TGetTeamByUrlResponse | null = null;

  if (params.teamUrl) {
    team = await getTeamByUrl({ userId: user.id, teamUrl: params.teamUrl });
  }

  const { id } = params;

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
  });
}

export default function DocumentPage() {
  const loaderData = useSuperLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const [uiArtifact, setUiArtifact] = useState<UIArtifact>(initialArtifactData);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  // const PureHitboxLayer = ({
  //   hitboxRef,
  //   result,
  //   setArtifact,
  // }: {
  //   hitboxRef: React.RefObject<HTMLDivElement>;
  //   result: any;
  //   setArtifact: (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => void;
  // }) => {
  //   const handleClick = useCallback(
  //     (event: MouseEvent<HTMLElement>) => {
  //       const boundingBox = event.currentTarget.getBoundingClientRect();

  //       setArtifact((artifact) =>
  //         artifact.status === 'streaming'
  //           ? { ...artifact, isVisible: true }
  //           : {
  //               ...artifact,
  //               title: result.title,
  //               documentId: result.id,
  //               kind: result.kind,
  //               isVisible: true,
  //               boundingBox: {
  //                 left: boundingBox.x,
  //                 top: boundingBox.y,
  //                 width: boundingBox.width,
  //                 height: boundingBox.height,
  //               },
  //             },
  //       );
  //     },
  //     [setArtifact, result],
  //   );

  //   return (
  //     <div
  //       className="absolute left-0 top-0 z-10 size-full rounded-xl"
  //       ref={hitboxRef}
  //       onClick={handleClick}
  //       role="presentation"
  //       aria-hidden="true"
  //     >
  //       <div className="flex w-full items-center justify-end p-4">
  //         <div className="absolute right-[9px] top-[13px] rounded-md p-2 hover:bg-zinc-100 hover:dark:bg-zinc-700">
  //           <Maximize />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (initialArtifactData.documentId && boundingBox) {
      setUiArtifact((artifact) => ({
        ...artifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [initialArtifactData.documentId, setUiArtifact]);

  const retryDocument = trpc.document.retryContractData.useMutation();

  const { document, documentRootPath, contract } = loaderData;
  const { recipients, documentData } = document;

  const handleRetry = async () => {
    try {
      setIsGenerating(true);
      const { publicAccessToken, id } = await retryDocument.mutateAsync({
        documentId: contract.documentId,
      });
      void navigate(`${documentRootPath}/${contract.documentId}/${id}/${publicAccessToken}/retry`);
    } catch (error) {
      console.error('Error navigating to folders:', error);
      setIsGenerating(false);
    }
  };
  return (
    <div className="mx-auto -mt-4 w-full px-4 md:px-8">
      {document.status === DocumentStatus.PENDING && (
        <DocumentRecipientLinkCopyDialog recipients={recipients} />
      )}
      {/* <div className="relative w-full cursor-pointer">
        <HitboxLayer
          hitboxRef={hitboxRef}
          result={initialArtifactData}
          setArtifact={setUiArtifact}
        />
        <p>el pepe</p>
      </div> */}
      <AnimatePresence>
        {uiArtifact.isVisible && (
          <motion.div
            className="dark:bg-muted bg-background fixed z-50 flex h-screen w-screen flex-col overflow-y-scroll border-zinc-200 md:border-l dark:border-zinc-700"
            initial={{
              opacity: 1,
              x: initialArtifactData.boundingBox.left,
              y: initialArtifactData.boundingBox.top,
              height: windowHeight,
              width: windowWidth ? windowWidth : 'calc(100dvw)',
              borderRadius: 50,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              height: windowHeight,
              width: windowWidth ? windowWidth : 'calc(100dvw)',
              borderRadius: 0,
              transition: {
                delay: 0,
                type: 'spring',
                stiffness: 200,
                damping: 30,
                duration: 5000,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: {
                delay: 0.1,
                type: 'spring',
                stiffness: 600,
                damping: 30,
              },
            }}
          >
            <div className="flex flex-col items-start justify-between p-2">
              <div className="flex flex-row items-start gap-4">
                <Button
                  data-testid="artifact-close-button"
                  variant="outline"
                  className="h-fit p-2 dark:hover:bg-zinc-700"
                  onClick={() => {
                    setUiArtifact((currentArtifact) =>
                      currentArtifact.status === 'streaming'
                        ? {
                            ...currentArtifact,
                            isVisible: false,
                          }
                        : { ...initialArtifactData, status: 'idle' },
                    );
                  }}
                >
                  <XIcon size={18} />
                </Button>
              </div>
              <p>yo</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to={documentRootPath} className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        <Trans>Contracts</Trans>
      </Link>

      <div className="mt-6 grid w-full grid-cols-12 gap-8">
        <div className="dark:bg-mutedh-full col-span-12 w-full !max-w-full items-center">
          {contract && (
            <Component
              generating={isGenerating}
              handleRetry={handleRetry}
              documentRootPath={documentRootPath}
              contract={contract}
            />
          )}
        </div>
        <Card
          className="col-span-12 rounded-xl before:rounded-xl lg:col-span-6 xl:col-span-7"
          gradient
        >
          <CardContent className="p-2">
            <PDFViewer document={document} key={documentData.id} documentData={documentData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
