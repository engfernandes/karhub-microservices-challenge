import { parseOrderBy } from './parse-order-by.util';

describe('parseOrderBy Utility Function', () => {
  const allowedFields = ['name', 'createdAt', 'updatedAt'];
  const defaultField = 'name';

  it('should return the default sort order when sortBy is undefined', () => {
    const sortBy = undefined;

    const result = parseOrderBy(sortBy, allowedFields, defaultField, 'asc');

    expect(result).toEqual({ name: 'asc' });
  });

  it('should return the default sort order when sortBy is null', () => {
    const sortBy = null;

    const result = parseOrderBy(sortBy as any, allowedFields, defaultField);

    expect(result).toEqual({ name: 'asc' });
  });

  it('should correctly parse a valid "asc" sortBy string', () => {
    const sortBy = 'createdAt:asc';

    const result = parseOrderBy(sortBy, allowedFields, defaultField);

    expect(result).toEqual({ createdAt: 'asc' });
  });

  it('should correctly parse a valid "desc" sortBy string', () => {
    const sortBy = 'updatedAt:desc';

    const result = parseOrderBy(sortBy, allowedFields, defaultField);

    expect(result).toEqual({ updatedAt: 'desc' });
  });

  it('should normalize a direction with uppercase letters to lowercase', () => {
    const sortBy = 'name:DESC';

    const result = parseOrderBy(sortBy, allowedFields, defaultField);

    expect(result).toEqual({ name: 'desc' });
  });

  it('should return the default sort order if the field is not in allowedFields', () => {
    const sortBy = 'id:asc';

    const result = parseOrderBy(sortBy, allowedFields, defaultField);

    expect(result).toEqual({ name: 'asc' });
  });

  it('should return the default sort order if the direction is invalid', () => {
    const sortBy = 'name:ascending';

    const result = parseOrderBy(sortBy, allowedFields, defaultField);

    expect(result).toEqual({ name: 'asc' });
  });

  it('should return the default sort order if the sortBy string is malformed (missing direction)', () => {
    const sortBy = 'name';

    const result = parseOrderBy(sortBy, allowedFields, defaultField);

    expect(result).toEqual({ name: 'asc' });
  });

  it('should respect the provided default direction when sortBy is not provided', () => {
    const sortBy = undefined;

    const result = parseOrderBy(sortBy, allowedFields, defaultField, 'desc');

    expect(result).toEqual({ name: 'desc' });
  });
});
