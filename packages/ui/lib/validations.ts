import { Contract, ContractStatus } from '@prisma/client';
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';
import * as z from 'zod';

import { flagConfig } from '../config/flag';
import { getFiltersStateParser, getSortingStateParser } from './parsers';

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(flagConfig.featureFlags.map((flag) => flag.value)),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Contract>().withDefault([{ id: 'createdAt', desc: true }]),
  title: parseAsString.withDefault(''),
  status: parseAsArrayOf(
    z.enum(Object.values(ContractStatus) as [string, ...string[]]),
  ).withDefault([]),
  estimatedHours: parseAsArrayOf(z.coerce.number()).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
});

export const createTaskSchema = z.object({
  title: z.string(),
  status: z.enum(Object.values(ContractStatus) as [string, ...string[]]),
  estimatedHours: z.coerce.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  status: z.enum(Object.values(ContractStatus) as [string, ...string[]]).optional(),
  estimatedHours: z.coerce.number().optional(),
});

export type GetTasksSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
