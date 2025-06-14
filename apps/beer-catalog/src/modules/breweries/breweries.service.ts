import { Injectable } from '@nestjs/common';
import {
  BreweryEntity,
  CreateBreweryDto,
  FilterConfig,
  parseOrderBy,
  parseWhere,
  QueryBreweryDto,
  ResponseEntity,
  UpdateBreweryDto,
} from 'libs/common';
import { PrismaService } from 'libs/core';
import { Prisma } from '@prisma/client';

const FILTER_CONFIG: FilterConfig = {
  name: {
    operator: 'contains',
    modelField: 'name',
  },
};
const ALLOWED_SORT_FIELDS = ['id', 'name', 'createdAt', 'updatedAt'];

/**
 * Service responsible for managing breweries, including creation, retrieval, update, and deletion.
 */
@Injectable()
export class BreweriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new brewery.
   * @param createBreweryDto The data to create the new brewery.
   * @returns The newly created brewery entity.
   * @throws {Error} If a brewery with the same name already exists.
   */
  async create(
    createBreweryDto: CreateBreweryDto,
  ): Promise<ResponseEntity<BreweryEntity>> {
    try {
      const newBrewery = await this.prisma.brewery.create({
        data: createBreweryDto,
      });

      return new ResponseEntity(new BreweryEntity(newBrewery));
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new Error('Brewery with this name already exists');
      }
      throw error;
    }
  }

  /**
   * Returns a list of all breweries, with optional filtering, sorting, and pagination.
   * @param query The query parameters for filtering, sorting, and pagination.
   * @returns A paginated response entity containing brewery entities.
   */
  async findAll(
    query: QueryBreweryDto,
  ): Promise<ResponseEntity<BreweryEntity[]>> {
    const { sortBy } = query;
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where = parseWhere<Prisma.BreweryWhereInput>(query, FILTER_CONFIG);
    const orderBy = parseOrderBy(sortBy, ALLOWED_SORT_FIELDS, 'name');

    const [breweries, total] = await this.prisma.$transaction([
      this.prisma.brewery.findMany({
        where,
        skip,
        orderBy,
        take: limit,
      }),
      this.prisma.brewery.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const data = breweries.map((brewery) => new BreweryEntity(brewery));
    const meta = { total, page, limit, totalPages };

    return new ResponseEntity<BreweryEntity[]>(data, meta);
  }

  /**
   * Finds a single brewery by its ID.
   * @param id The ID of the brewery to be found.
   * @returns The found brewery entity.
   * @throws {Error} If the brewery with the provided ID is not found.
   */
  async findOne(id: number): Promise<ResponseEntity<BreweryEntity>> {
    const brewery = await this.findBreweryById(id);

    return new ResponseEntity<BreweryEntity>(new BreweryEntity(brewery));
  }

  /**
   * Updates an existing brewery.
   * @param id The ID of the brewery to be updated.
   * @param updateBreweryDto The data to be updated.
   * @returns The updated brewery entity.
   * @throws {Error} If the brewery with the provided ID is not found.
   */
  async update(
    id: number,
    updateBreweryDto: UpdateBreweryDto,
  ): Promise<ResponseEntity<BreweryEntity>> {
    await this.findBreweryById(id);

    const updatedBrewery = await this.prisma.brewery.update({
      where: { id },
      data: updateBreweryDto,
    });

    return new ResponseEntity<BreweryEntity>(new BreweryEntity(updatedBrewery));
  }

  /**
   * Removes a brewery from the database.
   * @param id The ID of the brewery to be removed.
   * @returns An empty response entity.
   * @throws {Error} If the brewery with the provided ID is not found.
   */
  async remove(id: number): Promise<ResponseEntity<void>> {
    await this.findBreweryById(id);

    await this.prisma.brewery.delete({
      where: { id },
    });

    return new ResponseEntity<void>(undefined);
  }

  /**
   * Finds a brewery by its ID or throws an Error if not found.
   * @param id The ID of the brewery.
   * @returns The found brewery entity.
   * @throws {Error} If the brewery with the provided ID is not found.
   */
  async findBreweryById(id: number): Promise<BreweryEntity> {
    const brewery = await this.prisma.brewery.findUnique({
      where: { id },
    });

    if (!brewery) {
      throw new Error(`Brewery with ID ${id} not found`);
    }

    return new BreweryEntity(brewery);
  }
}
