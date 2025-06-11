import { Role } from '@prisma/client';

import { prisma } from '@documenso/prisma';

import { AppError, AppErrorCode } from '../../errors/app-error';

export interface CreateArtistOptions {
  name: string;
  role?: Role[];
  url?: string;
  avatarImageId?: string | null;
  disabled?: boolean;
  teamId?: number;
  userId?: number;
}

export const createArtist = async ({
  name,
  role,
  avatarImageId,
  disabled,
  url,
  teamId,
  userId,
}: CreateArtistOptions) => {
  const artistExists = await prisma.artist.findFirst({
    where: {
      name: name,
    },
  });

  if (artistExists) {
    throw new AppError(AppErrorCode.ALREADY_EXISTS);
  }

  const artist = await prisma.$transaction(async (tx) => {
    const artist = await tx.artist.create({
      data: {
        name,
        roles: role,
        avatarImageId,
        disabled,
        url,
        ...(teamId ? { teamId } : {}),
        userId,
      },
    });

    return artist;
  });

  return artist;
};
