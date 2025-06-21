import { useMemo } from 'react';

import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { ZFindContractsInternalRequestSchema } from '@documenso/trpc/server/contracts-router/schema';

export const TypeSearchParams = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string()), z.undefined()]),
);

// const sortColumns = z
//   .enum([
//     'id',
//     'createdAt',
//     'updatedAt',
//     'status',
//     'title',
//     'fileName',
//     'startDate',
//     'endDate',
//     'isPossibleToExpand',
//     'possibleExtensionTime',
//     'documentId',
//   ])
//   .optional();

export function useSortParams(sortColumns: z.ZodEnum<[string, ...string[]]>) {
  const [searchParams] = useSearchParams();
  const sort = useMemo(
    () => TypeSearchParams.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );
  const filters = useMemo(() => {
    try {
      const f = sort.filters && JSON.parse(sort.filters as string);
      return Array.isArray(f) ? f : [];
    } catch {
      return [];
    }
  }, [sort.filters]);

  const applyFilters = useMemo(() => sort.applyFilters === 'true', [sort.applyFilters]);

  const applySorting = useMemo(() => sort.applySorting === 'true', [sort.applySorting]);

  const {
    perPage,
    page,
    query,
    status: statusParams,
  } = useMemo(() => {
    let q = '';
    let st: 'VIGENTE' | 'FINALIZADO' | 'NO_ESPECIFICADO' | undefined;
    let pp = 10;
    let p = 1;

    if (sort.perPage) {
      const n = parseInt(sort.perPage as string, 10);
      pp = isNaN(n) || n <= 0 ? 10 : n;
    }
    if (sort.page) {
      const n = parseInt(sort.page as string, 10);
      p = isNaN(n) || n <= 0 ? 1 : n;
    }
    if (sort.query) {
      q = sort.query as string;
    }
    if (sort.status) {
      const s = sort.status as string;
      st = ['VIGENTE', 'FINALIZADO', 'NO_ESPECIFICADO'].includes(s) ? (s as any) : undefined;
    }

    return { perPage: pp, page: p, query: q, status: st };
  }, [sort.perPage, sort.query, sort.status, sort.page]);

  const joinOperator = useMemo(
    () => (sort.joinOperator === 'or' ? 'or' : 'and'),
    [sort.joinOperator],
  ) as 'or' | 'and';

  const columnOrder = useMemo(() => {
    try {
      const arr = sort.sort && JSON.parse(sort.sort as string);
      if (Array.isArray(arr) && arr.length > 0) {
        const { id } = arr[0];
        return sortColumns.safeParse(id).success ? id : undefined;
      }
    } catch {}
    return 'title';
  }, [sort.sort]);

  const columnDirection = useMemo(() => {
    try {
      const arr = sort.sort && JSON.parse(sort.sort as string);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr[0].desc ? 'desc' : 'asc';
      }
    } catch {}
    return 'asc';
  }, [sort.sort]);

  return {
    filters,
    applyFilters,
    applySorting,
    perPage,
    page,
    query,
    statusParams,
    joinOperator,
    columnOrder,
    columnDirection,
  };
}
