import { DocumentVisibility, TeamMemberRole } from '@prisma/client';
import { match } from 'ts-pattern';

import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { deleteFile } from '@documenso/lib/server-only/document/DeleteObjectS3';
import { getPresignGetUrl } from '@documenso/lib/universal/upload/server-actions';
import { prisma } from '@documenso/prisma';

export interface DeleteFolderOptions {
  userId: number;
  teamId?: number;
  folderId: string;
}

export const deleteFolder = async ({ userId, teamId, folderId }: DeleteFolderOptions) => {
  let teamMemberRole: TeamMemberRole | null = null;

  if (teamId) {
    const team = await prisma.team.findFirst({
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

    if (!team) {
      throw new AppError(AppErrorCode.NOT_FOUND, {
        message: 'Team not found',
      });
    }

    teamMemberRole = team.members[0]?.role ?? null;
  }

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
      teamId,
    },
    include: {
      documents: true,
      subfolders: true,
      templates: true,
      files: true,
    },
  });

  if (!folder) {
    throw new AppError(AppErrorCode.NOT_FOUND, {
      message: 'Folder not found',
    });
  }

  if (folder.files.length > 0) {
    for (const file of folder.files) {
      try {
        if (file) {
          const documentData = await prisma.documentData.findUnique({
            where: { id: file.fileDataId },
            select: { data: true, id: true },
          });

          if (documentData && documentData.data) {
            const { url } = await getPresignGetUrl(documentData.data);
            await Promise.all([
              deleteFile(url),
              prisma.documentData.delete({
                where: { id: documentData.id },
              }),
            ]);
          } else {
            await prisma.files.delete({
              where: { id: file.id },
            });
          }
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('An error occurred while deleting the files.');
      }
    }
  }

  if (teamId && teamMemberRole) {
    const hasPermission = match(teamMemberRole)
      .with(TeamMemberRole.ADMIN, () => true)
      .with(TeamMemberRole.MANAGER, () => folder.visibility !== DocumentVisibility.ADMIN)
      .with(TeamMemberRole.MEMBER, () => folder.visibility === DocumentVisibility.EVERYONE)
      .otherwise(() => false);

    if (!hasPermission) {
      throw new AppError(AppErrorCode.UNAUTHORIZED, {
        message: 'You do not have permission to delete this folder',
      });
    }
  }

  return await prisma.folder.delete({
    where: {
      id: folderId,
    },
  });
};
