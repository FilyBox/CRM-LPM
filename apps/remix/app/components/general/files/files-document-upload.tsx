import { useMemo, useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { Loader } from 'lucide-react';
import { useParams } from 'react-router';
import { match } from 'ts-pattern';

import { useLimits } from '@documenso/ee/server-only/limits/provider/client';
import { useAnalytics } from '@documenso/lib/client-only/hooks/use-analytics';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { APP_DOCUMENT_UPLOAD_SIZE_LIMIT } from '@documenso/lib/constants/app';
import { DEFAULT_DOCUMENT_TIME_ZONE, TIME_ZONES } from '@documenso/lib/constants/time-zones';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { putGeneralFile } from '@documenso/lib/universal/upload/put-general-file';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { DocumentDropzone } from '@documenso/ui/primitives/document-upload';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@documenso/ui/primitives/tooltip';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useOptionalCurrentTeam } from '~/providers/team';

export type DropzoneProps = {
  className?: string;
};

export const UploadDropzone = ({ className }: DropzoneProps) => {
  const { _ } = useLingui();
  const { toast } = useToast();
  const { user } = useSession();
  const { folderId } = useParams();

  const team = useOptionalCurrentTeam();

  const analytics = useAnalytics();

  const userTimezone =
    TIME_ZONES.find((timezone) => timezone === Intl.DateTimeFormat().resolvedOptions().timeZone) ??
    DEFAULT_DOCUMENT_TIME_ZONE;

  const { quota, remaining, refreshLimits } = useLimits();

  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: createFile } = trpc.files.createFile.useMutation();

  const disabledMessage = useMemo(() => {
    if (remaining.documents === 0) {
      return team
        ? msg`Document upload disabled due to unpaid invoices`
        : msg`You have reached your document limit.`;
    }

    if (!user.emailVerified) {
      return msg`Verify your email to upload documents.`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining.documents, user.emailVerified, team]);

  const onFileDrop = async (file: File) => {
    try {
      setIsLoading(true);

      const response = await putGeneralFile(file);

      const { id } = await createFile({
        title: file.name,
        documentDataId: response.id,
        timezone: userTimezone,
        folderId: folderId ?? undefined,
      });

      void refreshLimits();

      toast({
        title: _(msg`File uploaded`),
        description: _(msg`Your file has been uploaded successfully.`),
        duration: 5000,
      });

      analytics.capture('App: File Uploaded', {
        userId: user.id,
        documentId: id,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const error = AppError.parseError(err);

      console.error(err);

      const errorMessage = match(error.code)
        .with(
          AppErrorCode.LIMIT_EXCEEDED,
          () => msg`You have reached your file limit for this month. Please upgrade your plan.`,
        )
        .otherwise(() => msg`An error occurred while uploading your file.`);

      toast({
        title: _(msg`Error`),
        description: _(errorMessage),
        variant: 'destructive',
        duration: 7500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileDropRejected = () => {
    toast({
      title: _(msg`Your file failed to upload.`),
      description: _(msg`File cannot be larger than ${APP_DOCUMENT_UPLOAD_SIZE_LIMIT}MB`),
      duration: 5000,
      variant: 'destructive',
    });
  };

  return (
    <div className={cn('relative', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DocumentDropzone
                disabled={remaining.documents === 0 || !user.emailVerified}
                disabledMessage={disabledMessage}
                onDrop={onFileDrop}
                onDropRejected={onFileDropRejected}
              />
            </div>
          </TooltipTrigger>
          {team?.id === undefined &&
            remaining.documents > 0 &&
            Number.isFinite(remaining.documents) && (
              <TooltipContent>
                <p className="text-sm">
                  <Trans>
                    {remaining.documents} of {quota.documents} documents remaining this month.
                  </Trans>
                </p>
              </TooltipContent>
            )}
        </Tooltip>
      </TooltipProvider>

      {isLoading && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center rounded-lg">
          <Loader className="text-muted-foreground h-12 w-12 animate-spin" />
        </div>
      )}
    </div>
  );
};
