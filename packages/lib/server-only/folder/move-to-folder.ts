import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { type TFolderType } from '@documenso/lib/types/folder-type';
import type { ApiRequestMetadata } from '@documenso/lib/universal/extract-request-metadata';
import { prisma } from '@documenso/prisma';

export interface MoveChatToFolderOptions {
  userId: number;
  teamId?: number;
  documentId: number;
  folderId?: string | null;
  requestMetadata?: ApiRequestMetadata;
  type?: TFolderType;
}

export const moveToFolder = async ({
  userId,
  teamId,
  documentId,
  folderId,
  type,
}: MoveChatToFolderOptions) => {
  let teamMemberRole = null;

  if (teamId !== undefined) {
    try {
      const team = await prisma.team.findFirstOrThrow({
        where: {
          id: teamId,
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          members: {
            where: {
              userId,
            },
            select: {
              role: true,
            },
          },
        },
      });

      teamMemberRole = team.members[0].role;
    } catch (error) {
      console.error('Error finding team:', error);
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Team not found',
      });
    }
  }

  const documentWhereClause = {
    id: documentId,
    ...(teamId
      ? {
          OR: [{ teamId }, { userId, teamId }],
        }
      : { userId, teamId: null }),
  };

  const document = await prisma.contract.findFirst({
    where: documentWhereClause,
  });
  if (!document) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Document not found',
    });
  }

  if (folderId) {
    const folderWhereClause = {
      id: folderId,
      type: type,
      ...(teamId
        ? {
            OR: [{ teamId }, { userId, teamId }],
          }
        : { userId, teamId: null }),
    };
    const folder = await prisma.folder.findFirst({
      where: folderWhereClause,
    });

    if (!folder) {
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Folder not found',
      });
    }
  }

  return await prisma.contract.update({
    where: {
      id: documentId,
    },
    data: {
      folderId,
    },
  });
};
