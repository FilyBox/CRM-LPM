// import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import { Release, TypeOfRelease } from '@prisma/client';
import { z } from 'zod';

import { findRelease } from '@documenso/lib/server-only/document/find-releases';
import { type GetReleaseType } from '@documenso/lib/server-only/document/get-release-type';
import { getReleaseType } from '@documenso/lib/server-only/document/get-release-type';
import { getTeamById } from '@documenso/lib/server-only/team/get-team';
// import { jobs } from '@documenso/lib/jobs/client';
// import { getTemplateById } from '@documenso/lib/server-only/template/get-template-by-id';
import { prisma } from '@documenso/prisma';
import { ExtendedRelease, ExtendedReleaseType } from '@documenso/prisma/types/extended-release';

import { authenticatedProcedure, router } from '../trpc';

export type GetTaskByIdOptions = {
  id: number;
  userId: number;
  teamId?: number;
  folderId?: string | null;
};

export const releaseRouter = router({
  createRelease: authenticatedProcedure
    .input(
      z.object({
        date: z.string().optional(),
        artist: z.string().optional(),
        lanzamiento: z.string().optional(),
        typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
        release: z.nativeEnum(Release).optional(),
        uploaded: z.string().optional(),
        streamingLink: z.string().optional(),
        assets: z.boolean().optional(),
        canvas: z.boolean().optional(),
        cover: z.boolean().optional(),
        audioWAV: z.boolean().optional(),
        video: z.boolean().optional(),
        banners: z.boolean().optional(),
        pitch: z.boolean().optional(),
        EPKUpdates: z.boolean().optional(),
        WebSiteUpdates: z.boolean().optional(),
        Biography: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { ...inputData } = input;
      // Verificar permisos si es tarea de equipo
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear releases en este equipo');
      }

      if (teamId) {
        const team = await getTeamById({ userId, teamId });
        if (!team) {
          throw new Error('Team not found');
        }

        const releaseCreated = await prisma.releases.create({
          data: {
            ...inputData,
            userId,
            teamId: team.id,
          },
        });

        return releaseCreated;
      }

      const releaseCreated = await prisma.releases.create({
        data: {
          ...input,
          userId,
        },
      });

      return releaseCreated;
    }),

  createManyReleases: authenticatedProcedure
    .input(
      z.object({
        releases: z.array(
          z.object({
            date: z.string().optional(),
            artist: z.string().optional(),
            lanzamiento: z.string().optional(),
            typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
            release: z.nativeEnum(Release).optional(),
            uploaded: z.string().optional(),
            streamingLink: z.string().optional(),
            assets: z.boolean().optional(),
            canvas: z.boolean().optional(),
            cover: z.boolean().optional(),
            audioWAV: z.boolean().optional(),
            video: z.boolean().optional(),
            banners: z.boolean().optional(),
            pitch: z.boolean().optional(),
            EPKUpdates: z.boolean().optional(),
            WebSiteUpdates: z.boolean().optional(),
            Biography: z.boolean().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { releases } = input;

      // Verify permissions if it's a team task
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear releases en este equipo');
      }

      // For large datasets, process in smaller chunks
      const BATCH_SIZE = 25; // Process 25 records at a time
      let totalCreated = 0;

      // Process releases in batches to avoid transaction timeouts
      for (let i = 0; i < releases.length; i += BATCH_SIZE) {
        const batch = releases.slice(i, i + BATCH_SIZE);

        // Process each batch in its own transaction
        const result = await prisma.$transaction(
          async (tx) => {
            const createdReleases = [];

            for (const file of batch) {
              // Normalize artist string for consistent processing
              const normalizedArtistString = (file.artist || '')
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

              // Create the release with associated artists
              const release = await tx.releases.create({
                data: {
                  ...file,
                  userId,
                  ...(teamId ? { teamId } : {}),
                  releasesArtists: { create: artistsData },
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
  findReleasesUniqueArtists: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniqueArtists = await prisma.releasesArtists.findMany({
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
  findTaskById: authenticatedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }: { input: { taskId: string } }) => {
      const { taskId } = input;
      return await prisma.task.findUnique({
        where: { id: Number(taskId) },
        include: {
          user: true,
          project: true,
          team: true,
          parentTask: true,
          subtasks: true,
          // tags: true, // Removed because 'tags' is not a valid property in 'TaskInclude<DefaultArgs>'
        },
      });
    }),

  // Agrega la siguiente mutación al router existente

  convertDates: authenticatedProcedure.mutation(async () => {
    // Spanish month mappings - incluye versiones con mayúsculas y minúsculas
    const spanishMonths: Record<string, number> = {
      enero: 0,
      Enero: 0,
      febrero: 1,
      Febrero: 1,
      marzo: 2,
      Marzo: 2,
      abril: 3,
      Abril: 3,
      mayo: 4,
      Mayo: 4,
      junio: 5,
      Junio: 5,
      julio: 6,
      Julio: 6,
      agosto: 7,
      Agosto: 7,
      septiembre: 8,
      Septiembre: 8,
      octubre: 9,
      Octubre: 9,
      noviembre: 10,
      Noviembre: 10,
      diciembre: 11,
      Diciembre: 11,
    };

    // Function to parse Spanish dates like "24 de abril" or "24 de Abril"
    function parseSpanishDate(dateString: string): Date | null {
      if (!dateString) return null;

      try {
        // No need to normalize to lowercase since we have both cases in the mapping
        const normalizedInput = dateString.trim();

        // Match patterns like "24 de abril", "24 abril", "24 de Abril", etc.
        const regex = /(\d+)(?:\s+de)?\s+([a-zA-Zé]+)(?:\s+de\s+(\d{4}))?/;
        const match = normalizedInput.match(regex);

        if (!match) return null;

        const day = parseInt(match[1], 10);
        const monthName = match[2];
        // If year is provided use it, otherwise use current year
        const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();

        if (!Object.prototype.hasOwnProperty.call(spanishMonths, monthName)) return null;
        const month = spanishMonths[monthName];
        const date = new Date(year, month, day);

        return date;
      } catch (error) {
        console.error(`Failed to parse date: ${dateString}`, error);
        return null;
      }
    }

    // Format date to ISO string or in a custom format
    function formatDate(date: Date | null): string {
      if (!date) return '';
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // Get all releases with text dates
    const releases = await prisma.releases.findMany({
      where: {
        date: {
          not: null,
        },
      },
      select: {
        id: true,
        date: true,
      },
    });

    let successCount = 0;
    let failCount = 0;

    // Process each release
    for (const release of releases) {
      const parsedDate = parseSpanishDate(release.date || '');

      if (parsedDate) {
        const formattedDate = formatDate(parsedDate);

        // Update the record
        await prisma.releases.update({
          where: { id: release.id },
          data: { date: formattedDate },
        });

        successCount++;
      } else {
        failCount++;
      }
    }

    return {
      success: true,
      processed: releases.length,
      successCount,
      failCount,
    };
  }),

  findRelease: authenticatedProcedure
    .input(
      z.object({
        // userId: z.number(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        type: z.nativeEnum(ExtendedReleaseType).optional(),
        release: z.nativeEnum(ExtendedRelease).optional(),
        orderBy: z
          .enum([
            'createdAt',
            'date',
            'lanzamiento',
            'typeOfRelease',
            'release',
            'uploaded',
            'streamingLink',
            'assets',
            'canvas',
            'cover',
            'audioWAV',
            'video',
            'banners',
            'pitch',
            'EPKUpdates',
            'WebSiteUpdates',
            'Biography',
          ])
          .optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        orderByColumn: z
          .enum([
            'createdAt',
            'date',
            'lanzamiento',
            'typeOfRelease',
            'uploaded',
            'release',
            'streamingLink',
            'assets',
            'canvas',
            'cover',
            'audioWAV',
            'video',
            'banners',
            'pitch',
            'EPKUpdates',
            'WebSiteUpdates',
            'Biography',
          ])
          .optional(),
        artistIds: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        query,
        type,
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
      const where: Prisma.ReleasesWhereInput = {
        ...(teamId && { teamId }),
        ...(query && {
          OR: [{ lanzamiento: { contains: query, mode: 'insensitive' } }],
        }),
      };

      if (type && type !== ExtendedReleaseType.ALL) {
        where.typeOfRelease = type;
      }
      const getStatOptions: GetReleaseType = {
        user,
        period,
        search: query,
        artistIds,
        teamId,
      };

      getReleaseType;
      const [stats] = await Promise.all([getReleaseType(getStatOptions)]);

      const [documents] = await Promise.all([
        findRelease({
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

      return { releases: documents, types: stats };
    }),

  updateRelease: authenticatedProcedure
    .input(
      z.object({
        id: z.number().min(1),
        date: z.string().optional(),
        artist: z.string().optional(),
        lanzamiento: z.string().optional(),
        typeOfRelease: z.nativeEnum(TypeOfRelease).optional(),
        release: z.nativeEnum(Release).optional(),
        uploaded: z.string().optional(),
        streamingLink: z.string().optional(),
        assets: z.boolean().optional(),
        canvas: z.boolean().optional(),
        cover: z.boolean().optional(),
        audioWAV: z.boolean().optional(),
        video: z.boolean().optional(),
        banners: z.boolean().optional(),
        pitch: z.boolean().optional(),
        EPKUpdates: z.boolean().optional(),
        WebSiteUpdates: z.boolean().optional(),
        Biography: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { ...data } = input;

      // Verificar permisos si es tarea de equipo
      // if (teamId && ctx.teamId !== teamId) {
      //   throw new Error('No tienes permisos para actualizar tareas en este equipo');
      // }

      return await prisma.releases.update({
        where: { id: Number(input.id) },
        data: {
          ...data,
        },
      });
    }),

  deleteRelease: authenticatedProcedure
    .input(z.object({ releaseId: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const { releaseId } = input;
      // Eliminar la tarea y sus subtareas
      await prisma.releases.deleteMany({
        where: {
          id: releaseId,
        },
      });
      return { success: true };
    }),

  deleteMultipleByIds: authenticatedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const { ids } = input;
      const deleted = await prisma.releases.deleteMany({
        where: { id: { in: ids } },
      });

      return deleted;
    }),
});
