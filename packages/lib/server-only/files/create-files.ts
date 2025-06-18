import type { DocumentSource } from '@prisma/client';
import type { DocumentVisibility, Team, TeamGlobalSettings } from '@prisma/client';
import { TeamMemberRole } from '@prisma/client';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import type { ApiRequestMetadata } from '@documenso/lib/universal/extract-request-metadata';
import { prisma } from '@documenso/prisma';

import { prefixedId } from '../../universal/id';
import { determineDocumentVisibility } from '../../utils/document-visibility';

export type CreateFilestOptions = {
  title: string;
  externalId?: string | null;
  userId: number;
  teamId?: number;
  documentDataId: string;
  formValues?: Record<string, string | number | boolean>;
  normalizePdf?: boolean;
  timezone?: string;
  requestMetadata: ApiRequestMetadata;
  folderId?: string;
  useToChat?: boolean;
  source?: DocumentSource;
};

export const createFiles = async ({
  userId,
  title,
  documentDataId,
  teamId,
  folderId,
  useToChat,
  source,
}: CreateFilestOptions) => {
  console.log('source of document', source);
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      teamMembers: {
        select: {
          teamId: true,
        },
      },
    },
  });

  if (
    teamId !== undefined &&
    !user.teamMembers.some((teamMember) => teamMember.teamId === teamId)
  ) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Team not found',
    });
  }

  let team: (Team & { teamGlobalSettings: TeamGlobalSettings | null }) | null = null;
  let userTeamRole: TeamMemberRole | undefined;

  if (teamId) {
    const teamWithUserRole = await prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
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
    });

    team = teamWithUserRole;
    userTeamRole = teamWithUserRole.members[0]?.role;
  }

  let folderVisibility: DocumentVisibility | undefined;

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
        teamId,
      },
      select: {
        visibility: true,
      },
    });

    if (!folder) {
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Folder not found',
      });
    }

    folderVisibility = folder.visibility;
  }

  return await prisma.$transaction(async (tx) => {
    const document = await tx.files.create({
      data: {
        title,
        qrToken: prefixedId('qr'),
        fileDataId: documentDataId,
        userId,
        teamId,
        folderId,
        useToChat,
        visibility:
          folderVisibility ??
          determineDocumentVisibility(
            team?.teamGlobalSettings?.documentVisibility,
            userTeamRole ?? TeamMemberRole.MEMBER,
          ),
      },
    });

    const createdDocument = await tx.files.findFirst({
      where: {
        id: document.id,
      },
    });

    if (!createdDocument) {
      throw new Error('File not found');
    }

    return createdDocument;
  });
};
