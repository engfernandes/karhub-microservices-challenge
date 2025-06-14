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
const ALLOWED_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'];

@Injectable()
export class BreweriesService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: number): Promise<ResponseEntity<BreweryEntity>> {
    const brewery = await this.findBreweryById(id);

    return new ResponseEntity<BreweryEntity>(new BreweryEntity(brewery));
  }

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

  async remove(id: number): Promise<ResponseEntity<void>> {
    await this.findBreweryById(id);

    await this.prisma.brewery.delete({
      where: { id },
    });

    return new ResponseEntity<void>(undefined);
  }

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
