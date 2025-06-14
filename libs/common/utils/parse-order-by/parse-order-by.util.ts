import { Prisma } from '@prisma/client';

type OrderByInput<T extends string> = { [key in T]?: Prisma.SortOrder };

/**
 * Parses a sort string (e.g., "name:asc") and converts it into an order object for Prisma.
 *
 * @template T The type of allowed field names for sorting.
 * @param sortBy The sort string from the query (e.g., "name:asc" or "id:desc").
 * @param allowedFields A list of fields allowed for sorting.
 * @param defaultField The default field to sort by if none is provided or if the field is invalid.
 * @param defaultDirection The default sort direction (asc or desc). Defaults to 'asc'.
 * @returns An order object compatible with Prisma, mapping field names to sort directions.
 */
export function parseOrderBy<T extends string>(
  sortBy: string | undefined,
  allowedFields: T[],
  defaultField: T,
  defaultDirection: Prisma.SortOrder = 'asc',
): { [key in T]?: Prisma.SortOrder } {
  if (!sortBy) {
    return { [defaultField]: defaultDirection } as OrderByInput<T>;
  }

  const [field, direction] = sortBy.split(':');
  const normalizedDirection = direction?.toLowerCase();

  if (
    allowedFields.includes(field as T) &&
    (normalizedDirection === 'asc' || normalizedDirection === 'desc')
  ) {
    return { [field]: normalizedDirection } as OrderByInput<T>;
  }

  return { [defaultField]: defaultDirection } as OrderByInput<T>;
}
