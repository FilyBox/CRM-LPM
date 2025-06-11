import type { Prisma, Releases, Team, TeamEmail } from '@prisma/client';
import { RecipientRole, SigningStatus } from '@prisma/client';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { prisma } from '@documenso/prisma';
import { ExtendedDocumentStatus } from '@documenso/prisma/types/extended-document-status';
import { ExtendedRelease, ExtendedReleaseType } from '@documenso/prisma/types/extended-release';

import { type FindResultResponse } from '../../types/search-params';

export type PeriodSelectorValue = '' | '7d' | '14d' | '30d';

export type FindReleaseOptions = {
  userId: number;
  teamId?: number;
  page?: number;
  artistIds?: number[];

  perPage?: number;
  orderBy?: {
    column: keyof Releases;
    direction: 'asc' | 'desc';
  };
  type?: ExtendedReleaseType;
  where?: Prisma.ReleasesWhereInput;
  release?: ExtendedRelease;
  period?: PeriodSelectorValue;
  query?: string;
};

export const findRelease = async ({
  userId,
  teamId,
  release = ExtendedRelease.ALL,
  type = ExtendedReleaseType.ALL,
  page = 1,
  perPage = 10,
  where,
  orderBy,
  artistIds,
  period,

  query,
}: FindReleaseOptions) => {
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

  const searchFilter: Prisma.ReleasesWhereInput = {
    OR: [
      { lanzamiento: { contains: query, mode: 'insensitive' } },
      { artist: { contains: query, mode: 'insensitive' } },
    ],
  };

  let filters: Prisma.ReleasesWhereInput | null = findReleasesFilter(release);
  filters = findReleasesTypeFilter(type);
  if (filters === null) {
    return {
      data: [],
      count: 0,
      currentPage: 1,
      perPage,
      totalPages: 0,
    };
  }

  let Filter: Prisma.ReleasesWhereInput = {
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

  const whereAndClause: Prisma.ReleasesWhereInput['AND'] = [
    { ...filters },
    { ...searchFilter },
    { ...Filter },
    { ...where },
  ];

  const whereClause: Prisma.ReleasesWhereInput = {
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
    whereClause.releasesArtists = {
      some: {
        artistId: {
          in: artistIds,
        },
      },
    };
  }

  const [data, count] = await Promise.all([
    prisma.releases.findMany({
      where: whereClause,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      include: {
        releasesArtists: true,
      },
      orderBy: {
        [orderByColumn]: orderByDirection,
      },
    }),
    prisma.releases.count({
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

const findReleasesTypeFilter = (type: ExtendedReleaseType) => {
  return match<ExtendedReleaseType, Prisma.ReleasesWhereInput>(type)
    .with(ExtendedReleaseType.ALL, () => ({
      OR: [],
    }))
    .with(ExtendedReleaseType.Album, () => ({
      typeOfRelease: ExtendedReleaseType.Album,
    }))
    .with(ExtendedReleaseType.EP, () => ({
      typeOfRelease: ExtendedReleaseType.EP,
    }))
    .with(ExtendedReleaseType.Sencillo, () => ({
      typeOfRelease: ExtendedReleaseType.Sencillo,
    }))
    .exhaustive();
};

const findReleasesFilter = (release: ExtendedRelease) => {
  return match<ExtendedRelease, Prisma.ReleasesWhereInput>(release)
    .with(ExtendedRelease.ALL, () => ({
      OR: [],
    }))
    .with(ExtendedRelease.Focus, () => ({
      release: ExtendedRelease.Focus,
    }))
    .with(ExtendedRelease.Soft, () => ({
      release: ExtendedRelease.Soft,
    }))
    .exhaustive();
};

/**
 * Create a Prisma filter for the Document schema to find documents for a team.
 *
 * Status All:
 *  - Documents that belong to the team
 *  - Documents that have been sent by the team email
 *  - Non draft documents that have been sent to the team email
 *
 * Status Inbox:
 *  - Non draft documents that have been sent to the team email that have not been signed
 *
 * Status Draft:
 * - Documents that belong to the team that are draft
 * - Documents that belong to the team email that are draft
 *
 * Status Pending:
 * - Documents that belong to the team that are pending
 * - Documents that have been sent by the team email that is pending to be signed by someone else
 * - Documents that have been sent to the team email that is pending to be signed by someone else
 *
 * Status Completed:
 * - Documents that belong to the team that are completed
 * - Documents that have been sent to the team email that are completed
 * - Documents that have been sent by the team email that are completed
 *
 * @param status The status of the documents to find.
 * @param team The team to find the documents for.
 * @returns A filter which can be applied to the Prisma Document schema.
 */
const findTeamDocumentsFilter = (
  status: ExtendedDocumentStatus,
  team: Team & { teamEmail: TeamEmail | null },
  visibilityFilters: Prisma.DocumentWhereInput[],
  folderId?: string,
) => {
  const teamEmail = team.teamEmail?.email ?? null;

  return match<ExtendedDocumentStatus, Prisma.DocumentWhereInput | null>(status)
    .with(ExtendedDocumentStatus.ALL, () => {
      const filter: Prisma.DocumentWhereInput = {
        // Filter to display all documents that belong to the team.
        OR: [
          {
            teamId: team.id,
            folderId: folderId,
            OR: visibilityFilters,
          },
        ],
      };

      if (teamEmail && filter.OR) {
        // Filter to display all documents received by the team email that are not draft.
        filter.OR.push({
          status: {
            not: ExtendedDocumentStatus.DRAFT,
          },
          recipients: {
            some: {
              email: teamEmail,
            },
          },
          OR: visibilityFilters,
          folderId: folderId,
        });

        // Filter to display all documents that have been sent by the team email.
        filter.OR.push({
          user: {
            email: teamEmail,
          },
          OR: visibilityFilters,
          folderId: folderId,
        });
      }

      return filter;
    })
    .with(ExtendedDocumentStatus.INBOX, () => {
      // Return a filter that will return nothing.
      if (!teamEmail) {
        return null;
      }

      return {
        status: {
          not: ExtendedDocumentStatus.DRAFT,
        },
        recipients: {
          some: {
            email: teamEmail,
            signingStatus: SigningStatus.NOT_SIGNED,
            role: {
              not: RecipientRole.CC,
            },
          },
        },
        OR: visibilityFilters,
        folderId: folderId,
      };
    })
    .with(ExtendedDocumentStatus.DRAFT, () => {
      const filter: Prisma.DocumentWhereInput = {
        OR: [
          {
            teamId: team.id,
            status: ExtendedDocumentStatus.DRAFT,
            OR: visibilityFilters,
            folderId: folderId,
          },
        ],
      };

      if (teamEmail && filter.OR) {
        filter.OR.push({
          status: ExtendedDocumentStatus.DRAFT,
          user: {
            email: teamEmail,
          },
          OR: visibilityFilters,
          folderId: folderId,
        });
      }

      return filter;
    })

    .with(ExtendedDocumentStatus.ERROR, () => {
      const filter: Prisma.DocumentWhereInput = {
        OR: [
          {
            teamId: team.id,
            status: ExtendedDocumentStatus.ERROR,
            OR: visibilityFilters,
            folderId: folderId,
          },
        ],
      };

      if (teamEmail && filter.OR) {
        filter.OR.push({
          status: ExtendedDocumentStatus.ERROR,
          user: {
            email: teamEmail,
          },
          OR: visibilityFilters,
          folderId: folderId,
        });
      }

      return filter;
    })
    .with(ExtendedDocumentStatus.PENDING, () => {
      const filter: Prisma.DocumentWhereInput = {
        OR: [
          {
            teamId: team.id,
            status: ExtendedDocumentStatus.PENDING,
            OR: visibilityFilters,
            folderId: folderId,
          },
        ],
      };

      if (teamEmail && filter.OR) {
        filter.OR.push({
          status: ExtendedDocumentStatus.PENDING,
          OR: [
            {
              recipients: {
                some: {
                  email: teamEmail,
                  signingStatus: SigningStatus.SIGNED,
                  role: {
                    not: RecipientRole.CC,
                  },
                },
              },
              OR: visibilityFilters,
              folderId: folderId,
            },
            {
              user: {
                email: teamEmail,
              },
              OR: visibilityFilters,
              folderId: folderId,
            },
          ],
        });
      }

      return filter;
    })
    .with(ExtendedDocumentStatus.COMPLETED, () => {
      const filter: Prisma.DocumentWhereInput = {
        status: ExtendedDocumentStatus.COMPLETED,
        OR: [
          {
            teamId: team.id,
            OR: visibilityFilters,
          },
        ],
      };

      if (teamEmail && filter.OR) {
        filter.OR.push(
          {
            recipients: {
              some: {
                email: teamEmail,
              },
            },
            OR: visibilityFilters,
          },
          {
            user: {
              email: teamEmail,
            },
            OR: visibilityFilters,
          },
        );
      }

      return filter;
    })
    .with(ExtendedDocumentStatus.REJECTED, () => {
      const filter: Prisma.DocumentWhereInput = {
        status: ExtendedDocumentStatus.REJECTED,
        OR: [
          {
            teamId: team.id,
            OR: visibilityFilters,
          },
        ],
      };

      if (teamEmail && filter.OR) {
        filter.OR.push(
          {
            recipients: {
              some: {
                email: teamEmail,
                signingStatus: SigningStatus.REJECTED,
              },
            },
            OR: visibilityFilters,
          },
          {
            user: {
              email: teamEmail,
            },
            OR: visibilityFilters,
          },
        );
      }

      return filter;
    })
    .exhaustive();
};
