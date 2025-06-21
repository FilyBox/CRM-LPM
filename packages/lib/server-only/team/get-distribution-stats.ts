// import { DistributionStatementTerritories, DistributionStatementMusicPlatforms, dis } from '@prisma/client';

// import { prisma } from '@documenso/prisma';

// export const getContractsStats = async (teamId?: number) => {

//   type DistributionTerritories = keyof DistributionStatementTerritories;

//   if (!teamId) {
//     return {
//       TOTAL_DISTRIBUTIONS: 0,
//       TERRITORIES: [],
//       PLATFORMS: [],
//       data: [],
//     };
//   }

//   const results = await prisma.distributionStatement.groupBy({
//     by: ['musicPlatforms'],
//     where: {
//       teamId,
//     },
//     include: {
//       distributionStatementMusicPlatforms: true
//     }
//   })

//   const data = await prisma.contract.findMany({
//     where: {
//       teamId,
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });

//   const stats = {
//     TOTAL_CONTRACTS: 0,
//     [ContractStatus.FINALIZADO]: 0,
//     [ContractStatus.NO_ESPECIFICADO]: 0,
//     [ContractStatus.VIGENTE]: 0,
//     data: data,
//   };

//   results.forEach((result) => {
//     const { status, _count } = result;

//     if (status !== null) {
//       stats[status] += _count;
//     }

//     stats.TOTAL_CONTRACTS += _count;
//   });

//   return stats;
// };
