export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte';
export type FilterConfig = {
  [queryKey: string]: {
    operator: FilterOperator;
    modelField?: string;
  };
};

/**
 * Builds a Prisma 'where' clause from a query DTO and a configuration map.
 * This function is generic and can be used for any Prisma model.
 *
 * @template TWhereInput The specific Prisma WhereInput type (e.g., Prisma.BeerStyleWhereInput).
 * @param query The DTO containing the URL query parameters.
 * @param config The map that defines how to translate query parameters into Prisma filters.
 * @returns An object of type TWhereInput, ready to be used with Prisma.
 */
export function parseWhere<TWhereInput>(
  query: object,
  config: FilterConfig,
): TWhereInput {
  const conditions: TWhereInput[] = [];

  for (const key in config) {
    if (
      Object.prototype.hasOwnProperty.call(query, key) &&
      query[key] !== undefined &&
      query[key] !== null &&
      query[key] !== ''
    ) {
      const value = query[key];
      const { operator, modelField } = config[key];
      const field = modelField || key;

      const condition = {};
      switch (operator) {
        case 'contains':
          if (typeof value === 'string') {
            condition[field] = { contains: value, mode: 'insensitive' };
          }
          break;
        case 'equals':
          condition[field] = { equals: value };
          break;
        case 'gte':
          condition[field] = { gte: value };
          break;
        case 'lte':
          condition[field] = { lte: value };
          break;
        case 'gt':
          condition[field] = { gt: value };
          break;
        case 'lt':
          condition[field] = { lt: value };
          break;
        default:
          condition[field] = { equals: value };
          break;
      }
      conditions.push(condition as TWhereInput);
    }
  }

  if (conditions.length > 0) {
    return { AND: conditions } as TWhereInput;
  }

  return {} as TWhereInput;
}
