import { QueryOptions } from "mongoose";
import { PopulateOptions } from "mongoose";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FindOptions<T> extends QueryOptions<T> {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: PopulateOptions[];
  lean?: boolean;
}

export interface FindResult<T> {
  count: number;
  data: T[];
  meta: PaginationMeta;
}
