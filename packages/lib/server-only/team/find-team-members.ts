import type { TeamMember } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { P, match } from 'ts-pattern';
import type { z } from 'zod';

import { prisma } from '@documenso/prisma';
import { TeamMemberSchema } from '@documenso/prisma/generated/zod/modelSchema/TeamMemberSchema';
import { UserSchema } from '@documenso/prisma/generated/zod/modelSchema/UserSchema';

import type { FindResultResponse } from '../../types/search-params';
import { ZFindResultResponse } from '../../types/search-params';

export interface FindTeamMembersOptions {
  userId: number;
  teamId: number;
  query?: string;
  page?: number;
  perPage?: number;
  orderBy?: {
    column: keyof TeamMember | 'name';
    direction: 'asc' | 'desc';
  };
}

export const ZFindTeamMembersResponseSchema = ZFindResultResponse.extend({
  data: TeamMemberSchema.extend({
    user: UserSchema.pick({
      name: true,
      email: true,
    }),
  }).array(),
});

export const ZFindTeamMembersLimitedResponseSchema = ZFindResultResponse.extend({
  data: UserSchema.pick({
    name: true,
    email: true,
  }).array(),
});

export type TFindTeamMembersResponse = z.infer<typeof ZFindTeamMembersResponseSchema>;
export type TFindTeamMembersLimitedResponse = z.infer<typeof ZFindTeamMembersLimitedResponseSchema>;

export const findTeamMembers = async ({
  userId,
  teamId,
  query,
  page = 1,
  perPage = 10,
  orderBy,
}: FindTeamMembersOptions): Promise<TFindTeamMembersResponse> => {
  const orderByColumn = orderBy?.column ?? 'name';
  const orderByDirection = orderBy?.direction ?? 'desc';

  // Check that the user belongs to the team they are trying to find members in.
  const userTeam = await prisma.team.findUniqueOrThrow({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
        },
      },
    },
  });

  const termFilters: Prisma.TeamMemberWhereInput | undefined = match(query)
    .with(P.string.minLength(1), () => ({
      user: {
        name: {
          contains: query,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    }))
    .otherwise(() => undefined);

  const whereClause: Prisma.TeamMemberWhereInput = {
    ...termFilters,
    teamId: userTeam.id,
  };

  let orderByClause: Prisma.TeamMemberOrderByWithRelationInput = {
    [orderByColumn]: orderByDirection,
  };

  // Name field is nested in the user so we have to handle it differently.
  if (orderByColumn === 'name') {
    orderByClause = {
      user: {
        name: orderByDirection,
      },
    };
  }

  const [data, count] = await Promise.all([
    prisma.teamMember.findMany({
      where: whereClause,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      orderBy: orderByClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.teamMember.count({
      where: whereClause,
    }),
  ]);

  return {
    data,
    count,
    currentPage: Math.max(page, 1),
    perPage,
    totalPages: Math.ceil(count / perPage),
  } satisfies FindResultResponse<typeof data>;
};

export const findTeamMembersLimited = async ({
  userId,
  teamId,
  query,
  page = 1,
  perPage = 10,
  orderBy,
}: FindTeamMembersOptions): Promise<TFindTeamMembersLimitedResponse> => {
  const orderByColumn = orderBy?.column ?? 'name';
  const orderByDirection = orderBy?.direction ?? 'desc';

  // Check that the user belongs to the team they are trying to find members in.
  const userTeam = await prisma.team.findUniqueOrThrow({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
        },
      },
    },
  });

  const termFilters: Prisma.TeamMemberWhereInput | undefined = match(query)
    .with(P.string.minLength(1), () => ({
      user: {
        name: {
          contains: query,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    }))
    .otherwise(() => undefined);

  const whereClause: Prisma.TeamMemberWhereInput = {
    ...termFilters,
    teamId: userTeam.id,
  };

  let orderByClause: Prisma.TeamMemberOrderByWithRelationInput = {
    [orderByColumn]: orderByDirection,
  };

  // Name field is nested in the user so we have to handle it differently.
  if (orderByColumn === 'name') {
    orderByClause = {
      user: {
        name: orderByDirection,
      },
    };
  }

  const teamMembers = await prisma.teamMember.findMany({
    where: whereClause,
    skip: Math.max(page - 1, 0) * perPage,
    take: perPage,
    orderBy: orderByClause,
    select: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const count = await prisma.teamMember.count({
    where: whereClause,
  });

  const data = teamMembers.map((member) => member.user);

  return {
    data,
    count,
    currentPage: Math.max(page, 1),
    perPage,
    totalPages: Math.ceil(count / perPage),
  } satisfies FindResultResponse<typeof data>;
};
