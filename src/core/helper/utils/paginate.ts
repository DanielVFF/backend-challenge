import { PaginatedResult } from '../interface/helper.types';

export async function paginate<T>(
  query: { page?: number; limit?: number },
  countFn: () => Promise<number>,
  dataFn: () => Promise<T[]>,
): Promise<PaginatedResult<T>> {
  const page = query.page ?? 0;
  const limit = query.limit ?? 10;

  const [total, data] = await Promise.all([countFn(), dataFn()]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: { page, limit, total, totalPages },
  };
}
