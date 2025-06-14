import { FilterConfig, parseWhere } from './parse-where.util';

describe('parseWhere Utility Function', () => {
  const filterConfig: FilterConfig = {
    name: { operator: 'contains' },
    status: { operator: 'equals' },
    age: { operator: 'gte' },
    price: { operator: 'lt' },
    brand: { operator: 'equals', modelField: 'brandName' },
  };

  it('should return an empty object if query is empty', () => {
    const query = {};
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({});
  });

  it('should create a single "contains" filter for a string value', () => {
    const query = { name: 'ale' };
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({
      AND: [{ name: { contains: 'ale', mode: 'insensitive' } }],
    });
  });

  it('should create a single "equals" filter for a number value', () => {
    const query = { status: 1 };
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({
      AND: [{ status: { equals: 1 } }],
    });
  });

  it('should create a single "gte" (greater than or equal) filter', () => {
    const query = { age: 18 };
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({
      AND: [{ age: { gte: 18 } }],
    });
  });

  it('should combine multiple filters correctly using AND', () => {
    const query = { name: 'ipa', status: 1, age: 21 };
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({
      AND: [
        { name: { contains: 'ipa', mode: 'insensitive' } },
        { status: { equals: 1 } },
        { age: { gte: 21 } },
      ],
    });
  });

  it('should ignore properties from query that are not in the config', () => {
    const query = { name: 'stout', unknownParam: 'ignore-me' };
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({
      AND: [{ name: { contains: 'stout', mode: 'insensitive' } }],
    });
  });

  it('should ignore properties from query that are undefined, null, or empty strings', () => {
    const query = {
      name: 'porter',
      status: undefined,
      age: null,
      price: '',
    };
    const result = parseWhere(query, filterConfig);
    expect(result).toEqual({
      AND: [{ name: { contains: 'porter', mode: 'insensitive' } }],
    });
  });

  it('should use "modelField" from config instead of the query key if provided', () => {
    const query = { brand: 'Karhub' };
    const result = parseWhere(query, filterConfig);

    expect(result).toEqual({
      AND: [{ brandName: { equals: 'Karhub' } }],
    });
  });

  it('should fall back to "equals" operator if an unknown operator is provided', () => {
    const customConfig: FilterConfig = {
      id: { operator: 'isExactly' as any },
    };
    const query = { id: 123 };
    const result = parseWhere(query, customConfig);
    expect(result).toEqual({
      AND: [{ id: { equals: 123 } }],
    });
  });
});
