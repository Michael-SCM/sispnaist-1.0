export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function getPaginationParams(query: { page?: string; limit?: string }, defaults = { page: 1, limit: 20 }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || String(defaults.page), 10) || defaults.page);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || String(defaults.limit), 10) || defaults.limit));
  return { page, limit, skip: (page - 1) * limit };
}

export function getPaginationResult(total: number, page: number, limit: number): PaginationResult {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}
