import type { Prisma, tuStreams } from '@prisma/client';
import { TypeOfTuStreams } from '@prisma/client';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { prisma } from '@documenso/prisma';

import { type FindResultResponse } from '../../types/search-params';

export const ExtendedTuStreamsType = {
  ...TypeOfTuStreams,

  ALL: 'ALL',
} as const;

export type ExtendedTuStreamsType =
  (typeof ExtendedTuStreamsType)[keyof typeof ExtendedTuStreamsType];

export type PeriodSelectorValue = '' | '7d' | '14d' | '30d';

export type FindTuStreamsOptions = {
  userId: number;
  teamId?: number;
  page?: number;
  artistIds?: number[];
  perPage?: number;
  orderBy?: {
    column: keyof Omit<tuStreams, 'type'>;
    direction: 'asc' | 'desc';
  };
  type?: ExtendedTuStreamsType;
  where?: Prisma.tuStreamsWhereInput;
  period?: PeriodSelectorValue;
  query?: string;
};

export const findTuStreams = async ({
  userId,
  teamId,
  type = ExtendedTuStreamsType.ALL,
  page = 1,
  perPage = 10,
  where,
  orderBy,
  artistIds,
  period,
  query,
}: FindTuStreamsOptions) => {
  let team = null;

  if (teamId !== undefined) {
    team = await prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        teamEmail: true,
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
  }

  const orderByColumn = orderBy?.column ?? 'createdAt';
  const orderByDirection = orderBy?.direction ?? 'desc';

  const searchFilter: Prisma.tuStreamsWhereInput = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { UPC: { contains: query, mode: 'insensitive' } },
      { artist: { contains: query, mode: 'insensitive' } },
    ],
  };

  const filters: Prisma.tuStreamsWhereInput | null = findTuStreamsTypeFilter(type);

  if (filters === null) {
    return {
      data: [],
      count: 0,
      currentPage: 1,
      perPage,
      totalPages: 0,
    };
  }

  let Filter: Prisma.tuStreamsWhereInput = {
    AND: {
      OR: [
        {
          userId,
        },
      ],
    },
  };

  if (team) {
    Filter = {
      AND: {
        OR: team.teamEmail
          ? [
              {
                teamId: team.id,
              },
              {
                user: {
                  email: team.teamEmail.email,
                },
              },
            ]
          : [
              {
                teamId: team.id,
              },
            ],
      },
    };
  } else {
    Filter = {
      AND: {
        OR: [
          {
            userId,
            teamId: null,
          },
        ],
      },
    };
  }

  const whereAndClause: Prisma.tuStreamsWhereInput['AND'] = [
    { ...filters },
    { ...searchFilter },
    { ...Filter },
    { ...where },
  ];

  const whereClause: Prisma.tuStreamsWhereInput = {
    AND: whereAndClause,
  };

  if (period) {
    const daysAgo = parseInt(period.replace(/d$/, ''), 10);
    const startOfPeriod = DateTime.now().minus({ days: daysAgo }).startOf('day');
    whereClause.createdAt = {
      gte: startOfPeriod.toJSDate(),
    };
  }

  if (artistIds && artistIds.length > 0) {
    whereClause.tuStreamsArtists = {
      some: {
        artistId: {
          in: artistIds,
        },
      },
    };
  }

  const [data, count] = await Promise.all([
    prisma.tuStreams.findMany({
      where: whereClause,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      include: {
        tuStreamsArtists: true,
        user: true,
        team: true,
        memebers: true,
      },
      orderBy: {
        [orderByColumn]: orderByDirection,
      },
    }),
    prisma.tuStreams.count({
      where: whereClause,
    }),
  ]);

  return {
    data: data,
    count,
    currentPage: Math.max(page, 1),
    perPage,
    totalPages: Math.ceil(count / perPage),
  } satisfies FindResultResponse<typeof data>;
};
const findTuStreamsTypeFilter = (type: ExtendedTuStreamsType) => {
  return match<ExtendedTuStreamsType, Prisma.tuStreamsWhereInput>(type)
    .with(ExtendedTuStreamsType.ALL, () => ({}))
    .with(ExtendedTuStreamsType.Sencillo, () => ({
      type: 'Sencillo',
    }))
    .with(ExtendedTuStreamsType.Album, () => ({
      type: 'Album',
    }))
    .with(ExtendedTuStreamsType.Single, () => ({
      type: 'Single',
    }))
    .with(ExtendedTuStreamsType.EP, () => ({
      type: 'EP',
    }))
    .exhaustive();
};
