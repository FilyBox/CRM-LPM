// import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { z } from 'zod';

import { findDistribution } from '@documenso/lib/server-only/document/find-distribution';
import { type GetStatsInput } from '@documenso/lib/server-only/document/get-priority';
// import { jobs } from '@documenso/lib/jobs/client';
// import { getTemplateById } from '@documenso/lib/server-only/template/get-template-by-id';
import { prisma } from '@documenso/prisma';

import { authenticatedProcedure, router } from '../trpc';

export type GetTaskByIdOptions = {
  id: number;
  userId: number;
  teamId?: number;
  folderId?: string | null;
};

export const distributionRouter = router({
  createDistribution: authenticatedProcedure
    .input(
      z.object({
        territories: z
          .array(
            z.object({
              id: z.number(),
              name: z.string().nullable(),
            }),
          )
          .optional(),
        musicPlatform: z
          .array(
            z.object({
              id: z.number(),
              name: z.string().nullable(),
            }),
          )
          .optional(),
        marketingOwner: z.string().optional(),
        nombreDistribucion: z.string().optional(),
        proyecto: z.string().optional(),
        numeroDeCatalogo: z.string().optional(),
        upc: z.string().optional(),
        localProductNumber: z.string().optional(),
        isrc: z.string().optional(),
        tituloCatalogo: z.string().optional(),
        mesReportado: z.number().int().optional(),
        territorio: z.string().optional(),
        codigoDelTerritorio: z.string().optional(),
        nombreDelTerritorio: z.string().optional(),
        tipoDePrecio: z.string().optional(),
        tipoDeIngreso: z.string().optional(),
        venta: z.number().optional(),
        rtl: z.number().optional(),
        ppd: z.number().optional(),
        rbp: z.number().optional(),
        tipoDeCambio: z.number().optional(),
        valorRecibido: z.number().optional(),
        regaliasArtisticas: z.number().optional(),
        costoDistribucion: z.number().optional(),
        copyright: z.number().optional(),
        cuotaAdministracion: z.number().optional(),
        costoCarga: z.number().optional(),
        otrosCostos: z.number().optional(),
        ingresosRecibidos: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { territories, musicPlatform, ...data } = input;

      console.log('territories to create:', territories);
      console.log('musicPlatform to create:', musicPlatform);
      const allData = { ...data, userId, ...(teamId ? { teamId } : {}) };

      return await prisma.distributionStatement.create({
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
          distributionStatementMusicPlatforms: {
            create:
              musicPlatform?.map((platform) => ({
                name: platform.name?.trim() || '',
                user: {
                  connect: { id: userId },
                },
                ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                platform: {
                  connectOrCreate: {
                    where: { name: platform.name?.trim() || '' },
                    create: {
                      name: platform.name?.trim() || '',
                      user: {
                        connect: { id: userId },
                      },
                      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    },
                  },
                },
              })) || [],
          },

          distributionStatementTerritories: {
            create:
              territories?.map((territory) => ({
                name: territory.name?.trim() || '',
                user: {
                  connect: { id: userId },
                },
                ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                territory: {
                  connectOrCreate: {
                    where: { name: territory.name?.trim() || '' },
                    create: {
                      name: territory.name?.trim() || '',
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

  updateDistributionById: authenticatedProcedure
    .input(
      z.object({
        id: z.number(),
        territories: z
          .array(
            z.object({
              id: z.number(),
              name: z.string().nullable(),
            }),
          )
          .optional(),
        musicPlatform: z
          .array(
            z.object({
              id: z.number(),
              name: z.string().nullable(),
            }),
          )
          .optional(),
        marketingOwner: z.string().optional(),
        nombreDistribucion: z.string().optional(),
        proyecto: z.string().optional(),
        numeroDeCatalogo: z.string().optional(),
        upc: z.string().optional(),
        localProductNumber: z.string().optional(),
        isrc: z.string().optional(),
        tituloCatalogo: z.string().optional(),
        mesReportado: z.number().int().optional(),
        territorio: z.string().optional(),
        codigoDelTerritorio: z.string().optional(),
        nombreDelTerritorio: z.string().optional(),
        tipoDePrecio: z.string().optional(),
        tipoDeIngreso: z.string().optional(),
        venta: z.number().optional(),
        rtl: z.number().optional(),
        ppd: z.number().optional(),
        rbp: z.number().optional(),
        tipoDeCambio: z.number().optional(),
        valorRecibido: z.number().optional(),
        regaliasArtisticas: z.number().optional(),
        costoDistribucion: z.number().optional(),
        copyright: z.number().optional(),
        cuotaAdministracion: z.number().optional(),
        costoCarga: z.number().optional(),
        otrosCostos: z.number().optional(),
        ingresosRecibidos: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, territories, musicPlatform, ...data } = input;
      const { user, teamId } = ctx;
      const userId = user.id;

      console.log('Updating LPM with ID:', id);
      console.log('updating music platforms:', musicPlatform);
      const pepe = await prisma.distributionStatement.update({
        where: { id },
        data: {
          ...data,
          distributionStatementMusicPlatforms:
            musicPlatform && musicPlatform.length > 0
              ? {
                  deleteMany: {}, // remove existing artists
                  create: musicPlatform.map((platform) => ({
                    name: platform.name?.trim() || '',
                    user: {
                      connect: { id: userId },
                    },
                    ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    platform: {
                      connectOrCreate: {
                        where: { name: platform.name?.trim() || '' },
                        create: {
                          name: platform.name?.trim() || '',
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
                  deleteMany: {}, // remove existing platforms if no new platforms provided
                },
          distributionStatementTerritories:
            territories && territories.length > 0
              ? {
                  deleteMany: {}, // remove existing territories
                  create: territories.map((territory) => ({
                    name: territory.name?.trim() || '',
                    user: {
                      connect: { id: userId },
                    },
                    ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                    territory: {
                      connectOrCreate: {
                        where: { name: territory.name?.trim() || '' },
                        create: {
                          name: territory.name?.trim() || '',
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
                  deleteMany: {}, // remove existing territories if no new territories provided
                },
        },
        include: {
          distributionStatementMusicPlatforms: true,
        },
      });

      console.log('pepe', pepe);

      return pepe;
    }),
  deleteDistributionById: authenticatedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.distributionStatement.delete({
        where: { id },
        include: {
          distributionStatementMusicPlatforms: true,
          distributionStatementTerritories: true,
        },
      });
    }),

  deleteMultipleByIds: authenticatedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const { ids } = input;
      const deleted = await prisma.distributionStatement.deleteMany({
        where: { id: { in: ids } },
      });

      return deleted;
    }),

  findDistributionId: authenticatedProcedure
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

  findDistribution: authenticatedProcedure
    .input(
      z.object({
        // userId: z.number(),
        query: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        period: z.enum(['7d', '14d', '30d']).optional(),
        orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
        orderByDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        orderByColumn: z.enum(['id']).optional(),
        artistIds: z.array(z.number()).optional(),
        platformIds: z.array(z.number()).optional(),
        territoryIds: z.array(z.number()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        query,
        page,
        perPage,
        orderByColumn = 'id',
        orderByDirection,
        period,
        territoryIds,
        platformIds,
        orderBy = 'createdAt',
      } = input;
      const { user, teamId } = ctx;
      const userId = user.id;
      // Construir el objeto where para los filtros
      const where: Prisma.DistributionStatementWhereInput = {
        ...(userId && { userId }),
        ...(teamId && { teamId }),
        ...(query && {
          OR: [{ nombreDistribucion: { contains: query, mode: 'insensitive' } }],
        }),
      };

      const getStatOptions: GetStatsInput = {
        user,
        period,
        search: query,
      };

      // if (teamId) {
      //   const team = await getTeamById({ userId: user.id, teamId });
      //   getStatOptions.team = {
      //     teamId: team.id,
      //     teamEmail: team.teamEmail?.email,
      //     currentTeamMemberRole: team.currentTeamMember?.role,
      //     currentUserEmail: user.email,
      //     userId: user.id,
      //   };
      // }

      let createdAt: Prisma.DistributionStatementWhereInput['createdAt'];

      if (period) {
        const daysAgo = parseInt(period.replace(/d$/, ''), 10);

        const startOfPeriod = DateTime.now().minus({ days: daysAgo }).startOf('day');

        createdAt = {
          gte: startOfPeriod.toJSDate(),
        };
      }

      where.createdAt = createdAt;
      // const [stats] = await Promise.all([getStats(getStatOptions)]);
      const [documents] = await Promise.all([
        findDistribution({
          query,
          page,
          perPage,
          period,
          userId,
          teamId,
          territoryIds,
          platformIds,

          orderBy: orderByColumn
            ? { column: orderByColumn, direction: orderByDirection }
            : undefined,
        }),
      ]);

      return documents;
    }),

  findDistributionUniqueTerritories: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniqueTerritories = await prisma.distributionStatementTerritories.findMany({
      where: {
        ...(teamId ? { teamId } : { teamId: null, userId }),
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    });

    return uniqueTerritories;
  }),

  findDistributionUniquePlatform: authenticatedProcedure.query(async ({ ctx }) => {
    const { user, teamId } = ctx;
    const userId = user.id;

    const uniquePlatforms = await prisma.distributionStatementMusicPlatforms.findMany({
      where: {
        ...(teamId ? { teamId } : { teamId: null, userId }),
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    });

    return uniquePlatforms;
  }),

  createManyDistribution: authenticatedProcedure
    .input(
      z.object({
        distributions: z.array(
          z.object({
            marketingOwner: z.string().optional(),
            nombreDistribucion: z.string().optional(),
            proyecto: z.string().optional(),
            numeroDeCatalogo: z.string().optional(),
            upc: z.string().optional(),
            localProductNumber: z.string().optional(),
            isrc: z.string().optional(),
            tituloCatalogo: z.string().optional(),
            mesReportado: z.number().int().optional(),
            territorio: z.string().optional(),
            codigoDelTerritorio: z.string().optional(),
            nombreDelTerritorio: z.string().optional(),
            tipoDePrecio: z.string().optional(),
            tipoDeIngreso: z.string().optional(),
            venta: z.number().optional(),
            rtl: z.number().optional(),
            ppd: z.number().optional(),
            rbp: z.number().optional(),
            tipoDeCambio: z.number().optional(),
            valorRecibido: z.number().optional(),
            regaliasArtisticas: z.number().optional(),
            costoDistribucion: z.number().optional(),
            copyright: z.number().optional(),
            cuotaAdministracion: z.number().optional(),
            costoCarga: z.number().optional(),
            otrosCostos: z.number().optional(),
            ingresosRecibidos: z.number().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, teamId } = ctx;
      const userId = user.id;
      const { distributions } = input;
      console.log('Creating multiple distribution statements:', distributions.length);
      console.log('tipo de cambio', distributions[0].tipoDeCambio);
      console.log('nombre del territorio', distributions[0].nombreDelTerritorio);
      console.log('codigo del territorio', distributions[0].codigoDelTerritorio);
      // Verify permissions if it's a team operation
      if (teamId && ctx.teamId !== teamId) {
        throw new Error('No tienes permisos para crear distribution statements en este equipo');
      }

      // For large datasets, process in smaller chunks
      const BATCH_SIZE = 25; // Process 25 records at a time
      let totalCreated = 0;

      // Process distributions in batches to avoid transaction timeouts
      for (let i = 0; i < distributions.length; i += BATCH_SIZE) {
        const batch = distributions.slice(i, i + BATCH_SIZE);

        // Process each batch in its own transaction
        const result = await prisma.$transaction(
          async (tx) => {
            const createdDistributions = [];

            for (const distributionData of batch) {
              // Create the distribution statement with related records
              const distribution = await tx.distributionStatement.create({
                data: {
                  ...distributionData,
                  userId,
                  ...(teamId ? { teamId } : {}),
                  // Create music platform relationship if territorio exists
                  ...(distributionData.territorio && {
                    distributionStatementMusicPlatforms: {
                      create: {
                        name: distributionData.territorio || '',
                        user: {
                          connect: { id: userId },
                        },
                        ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                        platform: {
                          connectOrCreate: {
                            where: { name: distributionData.territorio.trim() },
                            create: {
                              name: distributionData.territorio.trim(),
                              user: {
                                connect: { id: userId },
                              },
                              ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                            },
                          },
                        },
                      },
                    },
                  }),
                  // Create territory relationship if nombreDelTerritorio exists
                  ...(distributionData.nombreDelTerritorio && {
                    distributionStatementTerritories: {
                      create: {
                        name: distributionData.nombreDelTerritorio || '',
                        user: {
                          connect: { id: userId },
                        },
                        ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                        territory: {
                          connectOrCreate: {
                            where: { name: distributionData.nombreDelTerritorio.trim() },
                            create: {
                              name: distributionData.nombreDelTerritorio.trim(),
                              user: {
                                connect: { id: userId },
                              },
                              ...(teamId ? { team: { connect: { id: teamId } } } : {}),
                            },
                          },
                        },
                      },
                    },
                  }),
                },
              });

              createdDistributions.push(distribution);
            }

            return createdDistributions;
          },
          { timeout: 60000 }, // 60 second timeout for each batch
        );

        totalCreated += result.length;
        console.log(`Batch processed: ${i}-${i + batch.length}, created: ${result.length}`);
      }

      return totalCreated;
    }),
  // uploadTemplate: authenticatedProcedure

  // uploadBulkSend: authenticatedProcedure
  //   .input(
  //     z.object({
  //       taskId: z.number(),
  //       teamId: z.number().optional(),
  //       csv: z.string().min(1),
  //       sendImmediately: z.boolean(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { taskId, teamId, csv, sendImmediately } = input;
  //     const { user } = ctx;

  //     if (csv.length > 4 * 1024 * 1024) {
  //       throw new TRPCError({
  //         code: 'BAD_REQUEST',
  //         message: 'File size exceeds 4MB limit',
  //       });
  //     }

  //     const task = await getTemplateById({
  //       id: taskId,
  //       teamId,
  //       userId: user.id,
  //     });

  //     if (!task) {
  //       throw new TRPCError({
  //         code: 'NOT_FOUND',
  //         message: 'Template not found',
  //       });
  //     }

  //     await jobs.triggerJob({
  //       name: 'internal.bulk-send-template',
  //       payload: {
  //         userId: user.id,
  //         teamId,
  //         taskId,
  //         csvContent: csv,
  //         sendImmediately,
  //         requestMetadata: ctx.metadata.requestMetadata,
  //       },
  //     });

  //     return { success: true };
  //   }),
});
