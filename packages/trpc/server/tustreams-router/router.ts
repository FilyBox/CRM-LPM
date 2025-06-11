// import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import { TypeOfTuStreams } from '@prisma/client';
import { DateTime } from 'luxon';
import { z } from 'zod';

import { findTuStreams } from '@documenso/lib/server-only/document/find-tuStreams';
import { type GetTuStreamsType } from '@documenso/lib/server-only/document/get-tustreams-type';
import { getTuStreamsType } from '@documenso/lib/server-only/document/get-tustreams-type';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export const ExtendedTuStreamsType = {
  ...TypeOfTuStreams,

  ALL: 'ALL',
} as const;

export type ExtendedTuStreamsType =
  (typeof ExtendedTuStreamsType)[keyof typeof ExtendedTuStreamsType];

export type GetTuStreamsByIdOptions = {
  id: number;
  userId: number;
  teamId?: number;
};

export const tuStreamsRouter = router({
  createTuStreams: authenticatedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        UPC: z.string().optional(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        type: z.nativeEnum(TypeOfTuStreams).optional(),
        total: z.number().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { artists, ...data } = input;
      return await prisma.tuStreams.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
          ...(teamId ? { team: { connect: { id: teamId } } } : {}),
          tuStreamsArtists: {
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

  createManyTuStreams: authenticatedProcedure
    .input(
      z.object({
        tuStreams: z.array(
          z.object({
            title: z.string().optional(),
            UPC: z.string().optional(),
            artist: z.string().optional(),
            type: z.nativeEnum(TypeOfTuStreams).optional(),
            total: z.number().optional(),
            date: z.date().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { tuStreams } = input;
      console.log('Creating multiple tuStreams:', tuStreams.length);

      // Verify permissions if it's a team task
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear tuStreams en este equipo');
      }

      // For large datasets, process in smaller chunks
      const BATCH_SIZE = 25; // Process 25 records at a time
      let totalCreated = 0;

      // Process tuStreams in batches to avoid transaction timeouts
      for (let i = 0; i < tuStreams.length; i += BATCH_SIZE) {
        const batch = tuStreams.slice(i, i + BATCH_SIZE);

        // Process each batch in its own transaction
        const result = await prisma.$transaction(
          async (tx) => {
            const createdTuStreams = [];

            for (const stream of batch) {
              // Normalize artist string for consistent processing
              const normalizedArtistString = (stream.artist || '')
                .replace(/\s+ft\.\s+/gi, ', ')
                .replace(/\s+&\s+/g, ', ');

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

              // Create the tuStream with associated artists
              const tuStream = await tx.tuStreams.create({
                data: {
                  ...stream,
                  userId,
                  ...(teamId ? { teamId } : {}),
                  tuStreamsArtists: { create: artistsData },
                },
              });

              createdTuStreams.push(tuStream);
            }

            return createdTuStreams;
          },
          { timeout: 60000 }, // 60 second timeout for each batch
        );

        totalCreated += result.length;
        console.log(`Batch processed: ${i}-${i + batch.length}, created: ${result.length}`);
      }

      return totalCreated;
    }),

  findTuStreamsUniqueArtists: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniqueArtists = await prisma.tuStreamsArtists.findMany({
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

  findArtists: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const artists = await prisma.artist.findMany({
      where: {
        ...(teamId ? { teamId } : { teamId: null, userId }),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        teamId: true,
        userId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform artists into the required format
    const artistData = artists.map((artist) => ({
      createdAt: artist.createdAt,
      id: artist.id,
      teamId: artist.teamId,
      userId: artist.userId,
      artistName: artist.name,
      artistId: artist.id,
    }));

    return artistData;
  }),

  findTuStreamsById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: { input: { id: string } }) => {
      const { id } = input;
      return await prisma.tuStreams.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          team: true,
          tuStreamsArtists: true,
          memebers: true,
        },
      });
    }),

  findTuStreams: authenticatedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        type: z.nativeEnum(ExtendedTuStreamsType).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        orderByColumn: z
          .enum(['teamId', 'id', 'userId', 'createdAt', 'date', 'title', 'artist', 'UPC', 'total'])
          .optional(),
        artistIds: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { query, type, page, perPage, artistIds, orderByColumn, orderByDirection, period } =
        input;
      const { user, teamId } = ctx;
      const userId = user.id;
      // Construir el objeto where para los filtros
      const where: Prisma.tuStreamsWhereInput = {
        ...(teamId && { teamId }),
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { UPC: { contains: query, mode: 'insensitive' } },
            { artist: { contains: query, mode: 'insensitive' } },
          ],
        }),
      };

      if (type && type !== ExtendedTuStreamsType.ALL) {
        where.type = type;
      }

      const getStatOptions: GetTuStreamsType = {
        user,
        period,
        search: query,
        artistIds,
        teamId,
      };

      let createdAt: Prisma.tuStreamsWhereInput['createdAt'];

      if (period) {
        const daysAgo = parseInt(period.replace(/d$/, ''), 10);
        const startOfPeriod = DateTime.now().minus({ days: daysAgo }).startOf('day');
        createdAt = {
          gte: startOfPeriod.toJSDate(),
        };
      }

      where.createdAt = createdAt;

      const [stats] = await Promise.all([getTuStreamsType(getStatOptions)]);

      const [tuStreams] = await Promise.all([
        findTuStreams({
          query,
          page,
          perPage,
          artistIds,
          userId,
          teamId,
          period,
          where,
          orderBy: orderByColumn
            ? { column: orderByColumn, direction: orderByDirection }
            : undefined,
        }),
      ]);

      return { tuStreams, types: stats };
    }),

  updateTuStreams: authenticatedProcedure
    .input(
      z.object({
        id: z.number().min(1),
        title: z.string().optional(),
        UPC: z.string().optional(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        type: z.nativeEnum(TypeOfTuStreams).optional(),
        total: z.number().optional(),
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
      const pepe = await prisma.tuStreams.update({
        where: { id },
        data: {
          ...data,
          tuStreamsArtists:
            artists && artists.length > 0
              ? {
                  deleteMany: {},
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
                  deleteMany: {},
                },
        },
        include: {
          tuStreamsArtists: true,
        },
      });

      return pepe;
    }),

  deleteTuStreams: authenticatedProcedure
    .input(z.object({ id: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const pepe = await prisma.tuStreams.update({
        where: { id },
        data: {
          tuStreamsArtists: {
            deleteMany: {},
          },
        },
        include: {
          tuStreamsArtists: true,
        },
      });
      console.log('Deleting TuStreams with ID:', id, pepe);

      await prisma.tuStreams.deleteMany({
        where: {
          id,
        },
      });
      return { success: true };
    }),

  deleteMultipleByIds: authenticatedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const { ids } = input;

      const updateMany = await Promise.all(
        ids.map(async (id) =>
          prisma.tuStreams.update({
            where: { id },
            data: {
              tuStreamsArtists: {
                deleteMany: {},
              },
            },
          }),
        ),
      );

      const deleted = await prisma.tuStreams.deleteMany({
        where: { id: { in: ids } },
      });

      return deleted;
    }),
});
