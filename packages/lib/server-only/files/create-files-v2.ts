import type { DocumentVisibility, TemplateMeta } from '@prisma/client';
import { TeamMemberRole } from '@prisma/client';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import type { ApiRequestMetadata } from '@documenso/lib/universal/extract-request-metadata';
import { prefixedId } from '@documenso/lib/universal/id';
import { prisma } from '@documenso/prisma';
import type { TCreateDocumentV2Request } from '@documenso/trpc/server/document-router/schema';

import type { TDocumentAccessAuthTypes, TDocumentActionAuthTypes } from '../../types/document-auth';
import type { TDocumentFormValues } from '../../types/document-form-values';
import { determineDocumentVisibility } from '../../utils/document-visibility';

export type CreateFilesOptions = {
  userId: number;
  teamId?: number;
  documentDataId: string;
  normalizePdf?: boolean;
  data: {
    title: string;
    externalId?: string;
    visibility?: DocumentVisibility;
    globalAccessAuth?: TDocumentAccessAuthTypes;
    globalActionAuth?: TDocumentActionAuthTypes;
    formValues?: TDocumentFormValues;
    recipients: TCreateDocumentV2Request['recipients'];
  };
  meta?: Partial<Omit<TemplateMeta, 'id' | 'templateId'>>;
  requestMetadata: ApiRequestMetadata;
};

export const createFilesV2 = async ({
  userId,
  teamId,
  documentDataId,
  normalizePdf,
  data,
  meta,
  requestMetadata,
}: CreateFilesOptions) => {
  const { title, formValues } = data;

  const team = teamId
    ? await prisma.team.findFirst({
        where: {
          id: teamId,
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          teamGlobalSettings: true,
          members: {
            where: {
              userId: userId,
            },
            select: {
              role: true,
            },
          },
        },
      })
    : null;

  if (teamId !== undefined && !team) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Team not found',
    });
  }

  const visibility = determineDocumentVisibility(
    team?.teamGlobalSettings?.documentVisibility,
    team?.members[0].role ?? TeamMemberRole.MEMBER,
  );

  return await prisma.$transaction(async (tx) => {
    const document = await tx.files.create({
      data: {
        title,
        qrToken: prefixedId('qr'),
        userId,
        fileDataId: documentDataId,
        teamId,
        visibility,
      },
    });

    const createdDocument = await tx.files.findFirst({
      where: {
        id: document.id,
      },
      include: {
        documentData: true,
        folder: true,
      },
    });

    if (!createdDocument) {
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'File not found',
      });
    }

    return createdDocument;
  });
};
