import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BeerEntity,
  CreateBeerDto,
  FilterConfig,
  parseOrderBy,
  parseWhere,
  QueryBeerDto,
  ResponseEntity,
  UpdateBeerDto,
} from 'libs/common';
import { PrismaService } from 'libs/core';
import { Prisma } from '@prisma/client';

const FILTER_CONFIG: FilterConfig = {
  name: {
    operator: 'contains',
    modelField: 'name',
  },
  abv: {
    operator: 'equals',
    modelField: 'abv',
  },
  minAbv: {
    operator: 'gte',
    modelField: 'abv',
  },
  maxAbv: {
    operator: 'lte',
    modelField: 'abv',
  },
  styleId: {
    operator: 'equals',
    modelField: 'styleId',
  },
  breweryId: {
    operator: 'equals',
    modelField: 'breweryId',
  },
};
const ALLOWED_SORT_FIELDS = [
  'name',
  'abv',
  'createdAt',
  'updatedAt',
  'styleId',
  'breweryId',
];

@Injectable()
export class BeersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBeerDto: CreateBeerDto,
  ): Promise<ResponseEntity<BeerEntity>> {
    try {
      const newBeer = await this.prisma.beer.create({
        data: createBeerDto,
      });

      return new ResponseEntity(new BeerEntity(newBeer));
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('A beer with this name already exists.');
      }
      throw error;
    }
  }

  async findAll(query: QueryBeerDto): Promise<ResponseEntity<BeerEntity[]>> {
    const { sortBy } = query;
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where = parseWhere<Prisma.BeerWhereInput>(query, FILTER_CONFIG);
    const orderBy = parseOrderBy(sortBy, ALLOWED_SORT_FIELDS, 'name');

    const [beers, total] = await this.prisma.$transaction([
      this.prisma.beer.findMany({
        where,
        skip,
        orderBy,
        take: limit,
        include: {
          style: true,
          brewery: true,
        },
      }),
      this.prisma.beer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const data = beers.map((beer) => new BeerEntity(beer));
    const meta = { total, page, limit, totalPages };

    return new ResponseEntity<BeerEntity[]>(data, meta);
  }

  async findOne(id: number): Promise<ResponseEntity<BeerEntity>> {
    const beer = await this.findBeerById(id);

    return new ResponseEntity<BeerEntity>(new BeerEntity(beer));
  }

  async update(
    id: number,
    updateBeerDto: UpdateBeerDto,
  ): Promise<ResponseEntity<BeerEntity>> {
    await this.findBeerById(id);

    const updatedBeer = await this.prisma.beer.update({
      where: { id },
      data: updateBeerDto,
      include: {
        style: true,
        brewery: true,
      },
    });

    return new ResponseEntity<BeerEntity>(new BeerEntity(updatedBeer));
  }

  async remove(id: number): Promise<ResponseEntity<void>> {
    await this.findBeerById(id);

    await this.prisma.beer.delete({ where: { id } });

    return new ResponseEntity<void>(undefined);
  }

  async findBeerById(id: number): Promise<BeerEntity> {
    const beer = await this.prisma.beer.findUnique({
      where: { id },
      include: {
        style: true,
        brewery: true,
      },
    });

    if (!beer) {
      throw new NotFoundException(`Beer with ID ${id} not found.`);
    }

    return new BeerEntity(beer);
  }
}
