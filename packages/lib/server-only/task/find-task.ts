import { prisma } from '@documenso/prisma';

export type FindTasksOptions = {
  userId: number;
  teamId?: number;
};

export const findTasks = async ({ userId, teamId }: FindTasksOptions) => {
  return await prisma.task.findMany({
    where: {
      userId,
      teamId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      assignees: true,
      comments: true,
    },
  });
};

// export const getTaskById = async ({
//   id,
//   userId,
//   teamId,
//   folderId = null,
// }: GetTaskByIdOptions) => {
//   const template = await prisma.task.findFirst({
//     where: {
//       id,
//       ...(teamId
//         ? {
//             team: {
//               id: teamId,
//               members: {
//                 some: {
//                   userId,
//                 },
//               },
//             },
//           }
//         : {
//             userId,
//             teamId: null,
//           }),
//       ...(folderId ? { folderId } : {}),
//     },
//     include: {
//       directLink: true,
//       templateDocumentData: true,
//       templateMeta: true,
//       recipients: true,
//       fields: true,
//       user: {
//         select: {
//           id: true,
//           name: true,
//           email: true,
//         },
//       },
//       folder: true,
//     },
//   });

//   if (!template) {
//     throw new AppError(AppErrorCode.NOT_FOUND, {
//       message: 'Template not found',
//     });
//   }

//   return template;
// };
