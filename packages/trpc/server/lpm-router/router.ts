// If you need Prisma types, import them directly from "@prisma/client"
import { z } from 'zod';

import { findLpm } from '@documenso/lib/server-only/document/find-lpm';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetLpmByIdOptions = {
  id: number;
  productId: string;
  productType: string;
  productTitle: string;
  productVersion?: string;
  productDisplayArtist: string;
  parentLabel?: string;
  label: string;
  originalReleaseDate?: string;
  releaseDate: string;
  upc: string;
  catalog: string;
  productPriceTier?: string;
  productGenre?: string;
  submissionStatus: string;
  productCLine: string;
  productPLine: string;
  preOrderDate?: string;
  exclusives?: string;
  explicitLyrics: string;
  productPlayLink?: string;
  linerNotes?: string;
  primaryMetadataLanguage: string;
  compilation?: string;
  pdfBooklet?: string;
  timedReleaseDate?: string;
  timedReleaseMusicServices?: string;
  lastProcessDate: string;
  importDate: string;
  createdBy: string;
  lastModified: string;
  submittedAt: string;
  submittedBy?: string;
  vevoChannel?: string;
  trackType: string;
  trackId: string;
  trackVolume?: boolean;
  trackNumber: string;
  trackName: string;
  trackVersion?: string;
  trackDisplayArtist: string;
  isrc: string;
  trackPriceTier?: string;
  trackGenre: string;
  audioLanguage: string;
  trackCLine: string;
  trackPLine: string;
  writersComposers: string;
  publishersCollectionSocieties: string;
  withholdMechanicals: string;
  preOrderType?: string;
  instantGratificationDate: string;
  duration: string;
  sampleStartTime: string;
  explicitLyricsTrack: string;
  albumOnly: string;
  lyrics?: string;
  additionalContributorsPerforming?: string;
  additionalContributorsNonPerforming?: string;
  producers?: string;
  continuousMix: string;
  continuouslyMixedIndividualSong: string;
  trackPlayLink: string;
};

export const lpmRouter = router({
  createLpm: authenticatedProcedure
    .input(
      z.object({
        productId: z.string().optional().nullable(),
        productType: z.string().optional().nullable(),
        productTitle: z.string().optional().nullable(),
        productVersion: z.string().optional().nullable(),
        productDisplayArtist: z.string().optional().nullable(),
        parentLabel: z.string().optional().nullable(),
        label: z.string().optional().nullable(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        originalReleaseDate: z.date().optional().nullable(),
        releaseDate: z.date().optional().nullable(),
        upc: z.string().optional().nullable(),
        catalog: z.string().optional().nullable(),
        productPriceTier: z.string().optional().nullable(),
        productGenre: z.string().optional().nullable(),
        submissionStatus: z.string().optional().nullable(),
        productCLine: z.string().optional().nullable(),
        productPLine: z.string().optional().nullable(),
        preOrderDate: z.date().optional().nullable(),
        exclusives: z.string().optional().nullable(),
        explicitLyrics: z.string().optional().nullable(),
        productPlayLink: z.string().optional().nullable(),
        linerNotes: z.string().optional().nullable(),
        primaryMetadataLanguage: z.string().optional().nullable(),
        compilation: z.string().optional().nullable(),
        pdfBooklet: z.string().optional().nullable(),
        timedReleaseDate: z.date().optional().nullable(),
        timedReleaseMusicServices: z.date().optional().nullable(),
        lastProcessDate: z.date().optional().nullable(),
        importDate: z.date().optional().nullable(),
        createdBy: z.string().optional().nullable(),
        lastModified: z.date().optional().nullable(),
        submittedAt: z.date().optional().nullable(),
        submittedBy: z.string().optional().nullable(),
        vevoChannel: z.string().optional().nullable(),
        trackType: z.string().optional().nullable(),
        trackId: z.string().optional().nullable(),
        trackVolume: z.boolean().optional(),
        trackNumber: z.string().optional().nullable(),
        trackName: z.string().optional().nullable(),
        trackVersion: z.string().optional().nullable(),
        trackDisplayArtist: z.string().optional().nullable(),
        isrc: z.string().optional().nullable(),
        trackPriceTier: z.string().optional().nullable(),
        trackGenre: z.string().optional().nullable(),
        audioLanguage: z.string().optional().nullable(),
        trackCLine: z.string().optional().nullable(),
        trackPLine: z.string().optional().nullable(),
        writersComposers: z.string().optional().nullable(),
        publishersCollectionSocieties: z.string().optional().nullable(),
        withholdMechanicals: z.string().optional().nullable(),
        preOrderType: z.string().optional().nullable(),
        instantGratificationDate: z.date().optional().nullable(),
        duration: z.string().optional().nullable(),
        sampleStartTime: z.string().optional().nullable(),
        explicitLyricsTrack: z.string().optional().nullable(),
        albumOnly: z.string().optional().nullable(),
        lyrics: z.string().optional().nullable(),
        additionalContributorsPerforming: z.string().optional().nullable(),
        additionalContributorsNonPerforming: z.string().optional().nullable(),
        producers: z.string().optional().nullable(),
        continuousMix: z.string().optional().nullable(),
        continuouslyMixedIndividualSong: z.string().optional().nullable(),
        trackPlayLink: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { artists, ...data } = input;

      console.log('artists to create:', artists);
      const allData = { ...data, userId, ...(teamId ? { teamId } : {}) };

      return await prisma.lpm.create({
        // data: {
        //   ...cleanedInput,
        //   userId,
        //   ...(teamId ? { teamId } : {}), // Add teamId if it exists
        // } as unknown as Prisma.lpmCreateInput,
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
          ...(teamId ? { team: { connect: { id: teamId } } } : {}),
          lpmArtists: {
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

  createManyMusic: authenticatedProcedure
    .input(
      z.object({
        music: z.array(
          z.object({
            productId: z.string().optional().nullable(),
            productType: z.string().optional().nullable(),
            productTitle: z.string().optional().nullable(),
            productVersion: z.string().optional().nullable(),
            productDisplayArtist: z.string().optional().nullable(),
            parentLabel: z.string().optional().nullable(),
            label: z.string().optional().nullable(),
            artists: z
              .array(
                z.object({
                  id: z.number(),
                  artistName: z.string().nullable(),
                }),
              )
              .optional(),
            originalReleaseDate: z.date().optional().nullable(),
            releaseDate: z.date().optional().nullable(),
            upc: z.string().optional().nullable(),
            catalog: z.string().optional().nullable(),
            productPriceTier: z.string().optional().nullable(),
            productGenre: z.string().optional().nullable(),
            submissionStatus: z.string().optional().nullable(),
            productCLine: z.string().optional().nullable(),
            productPLine: z.string().optional().nullable(),
            preOrderDate: z.date().optional().nullable(),
            exclusives: z.string().optional().nullable(),
            explicitLyrics: z.string().optional().nullable(),
            productPlayLink: z.string().optional().nullable(),
            linerNotes: z.string().optional().nullable(),
            primaryMetadataLanguage: z.string().optional().nullable(),
            compilation: z.string().optional().nullable(),
            pdfBooklet: z.string().optional().nullable(),
            timedReleaseDate: z.date().optional().nullable(),
            timedReleaseMusicServices: z.date().optional().nullable(),
            lastProcessDate: z.date().optional().nullable(),
            importDate: z.date().optional().nullable(),
            createdBy: z.string().optional().nullable(),
            lastModified: z.date().optional().nullable(),
            submittedAt: z.date().optional().nullable(),
            submittedBy: z.string().optional().nullable(),
            vevoChannel: z.string().optional().nullable(),
            trackType: z.string().optional().nullable(),
            trackId: z.string().optional().nullable(),
            trackVolume: z.boolean().optional(),
            trackNumber: z.string().optional().nullable(),
            trackName: z.string().optional().nullable(),
            trackVersion: z.string().optional().nullable(),
            trackDisplayArtist: z.string().optional().nullable(),
            isrc: z.string().optional().nullable(),
            trackPriceTier: z.string().optional().nullable(),
            trackGenre: z.string().optional().nullable(),
            audioLanguage: z.string().optional().nullable(),
            trackCLine: z.string().optional().nullable(),
            trackPLine: z.string().optional().nullable(),
            writersComposers: z.string().optional().nullable(),
            publishersCollectionSocieties: z.string().optional().nullable(),
            withholdMechanicals: z.string().optional().nullable(),
            preOrderType: z.string().optional().nullable(),
            instantGratificationDate: z.date().optional().nullable(),
            duration: z.string().optional().nullable(),
            sampleStartTime: z.string().optional().nullable(),
            explicitLyricsTrack: z.string().optional().nullable(),
            albumOnly: z.string().optional().nullable(),
            lyrics: z.string().optional().nullable(),
            additionalContributorsPerforming: z.string().optional().nullable(),
            additionalContributorsNonPerforming: z.string().optional().nullable(),
            producers: z.string().optional().nullable(),
            continuousMix: z.string().optional().nullable(),
            continuouslyMixedIndividualSong: z.string().optional().nullable(),
            trackPlayLink: z.string().optional().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { music } = input;
      const { user, teamId } = ctx;
      const userId = user.id;

      // Process in batches to avoid timeout
      const BATCH_SIZE = 30; // Adjust based on your needs
      const allResults = [];

      for (let i = 0; i < music.length; i += BATCH_SIZE) {
        const batch = music.slice(i, i + BATCH_SIZE);

        const batchResults = await prisma.$transaction(
          async (prismaClient) => {
            const createdRecords = [];
            for (const file of batch) {
              console.log('Creating LPM record for:', file.productTitle);
              const { artists, ...fileData } = file;
              const result = await prismaClient.lpm.create({
                data: {
                  ...fileData,
                  user: {
                    connect: { id: userId },
                  },
                  ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                  lpmArtists: {
                    create: (file.trackDisplayArtist?.split(',') || []).map((artistName) => ({
                      artistName: artistName.trim(),
                      user: {
                        connect: { id: userId },
                      },
                      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                      artist: {
                        connectOrCreate: {
                          where: { name: artistName.trim() },
                          create: {
                            name: artistName.trim(),
                            user: {
                              connect: { id: userId },
                            },
                            ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                          },
                        },
                      },
                    })),
                  },
                },
              });
              createdRecords.push(result);
            }
            return createdRecords;
          },
          {
            maxWait: 10000, // 10 seconds
            timeout: 30000, // 30 seconds
          },
        );

        allResults.push(...batchResults);
      }
      return allResults.length;
    }),

  findLpmUniqueArtists: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniqueArtists = await prisma.lpmProductDisplayArtists.findMany({
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

  findLpmById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { id } = input;
      return await prisma.lpm.findUnique({
        where: { id },
        // include: {

        // },
      });
    }),
  findLpm: authenticatedProcedure
    .input(
      z.object({
        // userId: z.number(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        orderByColumn: z
          .enum(['id', 'lanzamiento', 'typeOfRelease', 'createdAt', 'updatedAt'])
          .optional(),
        artistIds: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        query,
        page,
        perPage,
        // release,
        orderByColumn,
        artistIds,
        orderByDirection,
        period,
        // orderBy = 'createdAt',
      } = input;

      const { user, teamId } = ctx;
      const userId = user.id;

      const [documents] = await Promise.all([
        findLpm({
          query,

          artistIds,
          page,
          perPage,
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
  updateLpmById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        productId: z.string().optional().nullable(),
        productType: z.string().optional().nullable(),
        productTitle: z.string().optional().nullable(),
        productVersion: z.string().optional().nullable(),
        productDisplayArtist: z.string().optional().nullable(),
        parentLabel: z.string().optional().nullable(),
        label: z.string().optional().nullable(),
        artists: z
          .array(
            z.object({
              id: z.number(),
              artistName: z.string().nullable(),
            }),
          )
          .optional(),
        originalReleaseDate: z.date().optional().nullable(),
        releaseDate: z.date().optional().nullable(),
        upc: z.string().optional().nullable(),
        catalog: z.string().optional().nullable(),
        productPriceTier: z.string().optional().nullable(),
        productGenre: z.string().optional().nullable(),
        submissionStatus: z.string().optional().nullable(),
        productCLine: z.string().optional().nullable(),
        productPLine: z.string().optional().nullable(),
        preOrderDate: z.date().optional().nullable(),
        exclusives: z.string().optional().nullable(),
        explicitLyrics: z.string().optional().nullable(),
        productPlayLink: z.string().optional().nullable(),
        linerNotes: z.string().optional().nullable(),
        primaryMetadataLanguage: z.string().optional().nullable(),
        compilation: z.string().optional().nullable(),
        pdfBooklet: z.string().optional().nullable(),
        timedReleaseDate: z.date().optional().nullable(),
        timedReleaseMusicServices: z.date().optional().nullable(),
        lastProcessDate: z.date().optional().nullable(),
        importDate: z.date().optional().nullable(),
        createdBy: z.string().optional().nullable(),
        lastModified: z.date().optional().nullable(),
        submittedAt: z.date().optional().nullable(),
        submittedBy: z.string().optional().nullable(),
        vevoChannel: z.string().optional().nullable(),
        trackType: z.string().optional().nullable(),
        trackId: z.string().optional().nullable(),
        trackVolume: z.boolean().optional(),
        trackNumber: z.string().optional().nullable(),
        trackName: z.string().optional().nullable(),
        trackVersion: z.string().optional().nullable(),
        trackDisplayArtist: z.string().optional().nullable(),
        isrc: z.string().optional().nullable(),
        trackPriceTier: z.string().optional().nullable(),
        trackGenre: z.string().optional().nullable(),
        audioLanguage: z.string().optional().nullable(),
        trackCLine: z.string().optional().nullable(),
        trackPLine: z.string().optional().nullable(),
        writersComposers: z.string().optional().nullable(),
        publishersCollectionSocieties: z.string().optional().nullable(),
        withholdMechanicals: z.string().optional().nullable(),
        preOrderType: z.string().optional().nullable(),
        instantGratificationDate: z.date().optional().nullable(),
        duration: z.string().optional().nullable(),
        sampleStartTime: z.string().optional().nullable(),
        explicitLyricsTrack: z.string().optional().nullable(),
        albumOnly: z.string().optional().nullable(),
        lyrics: z.string().optional().nullable(),
        additionalContributorsPerforming: z.string().optional().nullable(),
        additionalContributorsNonPerforming: z.string().optional().nullable(),
        producers: z.string().optional().nullable(),
        continuousMix: z.string().optional().nullable(),
        continuouslyMixedIndividualSong: z.string().optional().nullable(),
        trackPlayLink: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, artists, ...data } = input;
      const { user, teamId } = ctx;
      const userId = user.id;

      console.log('Updating LPM with ID:', id);
      console.log('updating artists:', artists);
      const pepe = await prisma.lpm.update({
        where: { id },
        data: {
          ...data,
          lpmArtists:
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
          lpmArtists: true,
        },
      });

      console.log('pepe', pepe);

      return pepe;
    }),
  deleteLpmById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.lpm.delete({
        where: { id },
      });
    }),

  deleteMultipleByIds: authenticatedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const { ids } = input;
      const deleted = await prisma.lpm.deleteMany({
        where: { id: { in: ids } },
      });

      return deleted;
    }),
});
