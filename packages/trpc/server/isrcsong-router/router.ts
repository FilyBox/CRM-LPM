import { z } from 'zod';

import { findIsrc } from '@documenso/lib/server-only/document/find-isrc';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetIsrcSongsByIdOptions = {
  id: number;
  trackName?: string;
  artist?: string;
  duration?: string;
  title?: string;
  license?: string;
  date?: string;
};

export const IsrcSongsRouter = router({
  createIsrcSongs: authenticatedProcedure
    .input(
      z.object({
        trackName: z.string().optional(),
        artist: z.string().optional(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        duration: z.string().optional(),
        title: z.string().optional(),
        license: z.string().optional(),
        date: z.date().optional(),
        isrc: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { artists, ...data } = input;

      return await prisma.isrcSongs.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
          ...(teamId ? { team: { connect: { id: teamId } } } : {}),
          isrcArtists: {
            create:
              artists?.map((artist) => ({
                artistName: artist.artistName?.trim() || '',
                user: {
                  connect: { id: userId },
                },
                ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                artist: {
                  connectOrCreate: {
                    where: { name: artist.artistName?.trim() || '' },
                    create: {
                      name: artist.artistName?.trim() || '',
                      user: {
                        connect: { id: userId },
                      },
                      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    },
                  },
                },
              })) || [],
          },
        },
      });
    }),

  createManyIsrcSongs: authenticatedProcedure
    .input(
      z.object({
        isrcSongs: z.array(
          z.object({
            trackName: z.string().optional(),
            artist: z.string().optional(),
            duration: z.string().optional(),
            title: z.string().optional(),
            license: z.string().optional(),
            date: z.date().optional(),
            isrc: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { isrcSongs } = input;
      const { user, teamId } = ctx;
      const userId = user.id;

      const createdIsrcSongs = await prisma.isrcSongs.createMany({
        data: isrcSongs,
      });

      // Verify permissions if it's a team task
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear releases en este equipo');
      }

      // For large datasets, process in smaller chunks
      const BATCH_SIZE = 25; // Process 25 records at a time
      let totalCreated = 0;

      // Process releases in batches to avoid transaction timeouts
      for (let i = 0; i < isrcSongs.length; i += BATCH_SIZE) {
        const batch = isrcSongs.slice(i, i + BATCH_SIZE);

        // Process each batch in its own transaction
        const result = await prisma.$transaction(
          async (tx) => {
            const createdReleases = [];

            for (const file of batch) {
              // Normalize artist string for consistent processing
              const normalizedArtistString = (file.artist || '')
                .replace(/\s+ft\.\s+/gi, ', ')
                .replace(/\s+&\s+/g, ', ')

                .replace(/\s+feat\.\s+/gi, ', ')

                .replace(/\s+ft\s+/gi, ', ')
                .replace(/\s+feat\s+/gi, ', ')
                .replace(/\s*\/\s*/g, ', '); // Cambiar \s+ por \s*

              // Create arrays of artist data
              const artistsData = normalizedArtistString
                .split(',')
                .filter((name) => name.trim() !== '')
                .map((artistName) => ({
                  artistName: artistName.trim(),
                  user: { connect: { id: userId } },
                  ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                  artist: {
                    connectOrCreate: {
                      where: { name: artistName.trim() },
                      create: {
                        name: artistName.trim(),
                        user: { connect: { id: userId } },
                        ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                      },
                    },
                  },
                }));

              // Create the release with associated artists
              const release = await tx.isrcSongs.create({
                data: {
                  ...file,
                  userId,
                  ...(teamId ? { teamId } : {}),
                  isrcArtists: { create: artistsData },
                },
              });

              createdReleases.push(release);
            }

            return createdReleases;
          },
          { timeout: 60000 }, // 60 second timeout for each batch
        );

        totalCreated += result.length;
        console.log(`Batch processed: ${i}-${i + batch.length}, created: ${result.length}`);
      }

      return totalCreated;
    }),

  findIsrcUniqueArtists: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniqueArtists = await prisma.isrcArtists.findMany({
      where: {
        ...(teamId ? { teamId } : { teamId: null, userId }),
      },
      distinct: ['artistName'],
      orderBy: {
        artistName: 'asc',
      },
    });

    return uniqueArtists;
  }),

  findIsrcSongs: authenticatedProcedure
    .input(
      z.object({
        // userId: z.number(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        artistIds: z.array(z.number()).optional(),

        period: z.enum(['7d', '14d', '30d']).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        orderByColumn: z
          .enum(['id', 'lanzamiento', 'typeOfRelease', 'createdAt', 'updatedAt'])
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        query,
        page,
        perPage,
        // release,
        artistIds,
        orderByColumn,
        orderByDirection,
        period,
        // orderBy = 'createdAt',
      } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      const [documents] = await Promise.all([
        findIsrc({
          query,
          page,
          perPage,
          artistIds,
          userId,
          teamId,
          period,
          orderBy: orderByColumn
            ? { column: orderByColumn, direction: orderByDirection }
            : undefined,
        }),
      ]);
      return documents;
    }),

  updateIsrcSongsById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        trackName: z.string().optional(),
        artist: z.string().optional(),
        duration: z.string().optional(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        title: z.string().optional(),
        license: z.string().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, artists, ...data } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      console.log('updating isrc song', id, 'and data:', data);

      console.log('Updating LPM with ID:', id);
      console.log('updating artists:', artists);
      const pepe = await prisma.isrcSongs.update({
        where: { id },
        data: {
          ...data,
          isrcArtists:
            artists && artists.length > 0
              ? {
                  deleteMany: {}, // remove existing artists
                  create: artists.map((artist) => ({
                    artistName: artist.artistName?.trim() || '',
                    user: {
                      connect: { id: userId },
                    },
                    ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    artist: {
                      connectOrCreate: {
                        where: { name: artist.artistName?.trim() || '' },
                        create: {
                          name: artist.artistName?.trim() || '',
                          user: {
                            connect: { id: userId },
                          },
                          ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                        },
                      },
                    },
                  })),
                }
              : {
                  deleteMany: {}, // remove existing artists if no new artists provided
                },
        },
        include: {
          isrcArtists: true,
        },
      });

      return pepe;
    }),

  deleteIsrcSongsById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const deletedIsrcSong = await prisma.isrcSongs.delete({
        where: { id },
      });

      return deletedIsrcSong;
    }),

  deleteMultipleByIds: authenticatedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const { ids } = input;
      const deleted = await prisma.isrcSongs.deleteMany({
        where: { id: { in: ids } },
      });

      return deleted;
    }),
});
