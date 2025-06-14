import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/core';
import { BeerStyle, Prisma } from '@prisma/client';
import {
  ResponseEntity,
  FilterConfig,
  parseOrderBy,
  parseWhere,
  CreateBeerStyleDto,
  QueryBeerStyleDto,
  UpdateBeerStyleDto,
  BeerStyleEntity,
} from 'libs/common';

const FILTER_CONFIG: FilterConfig = {
  name: {
    operator: 'contains',
    modelField: 'name',
  },
};
const ALLOWED_SORT_FIELDS = ['id', 'name', 'createdAt', 'updatedAt'];

/**
 * Service responsible for managing beer styles, including creation, retrieval, update, deletion,
 * and finding the best match by temperature.
 */
@Injectable()
export class BeerStylesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new beer style, automatically calculating its average temperature.
   * @param createBeerStyleDto The data to create the new style.
   * @returns The newly created beer style entity.
   * @throws {ConflictException} If a beer style with the same name already exists.
   */
  async create(
    createBeerStyleDto: CreateBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    try {
      const averageTemperature =
        (createBeerStyleDto.minTemperature +
          createBeerStyleDto.maxTemperature) /
        2;

      const newBeerStyle = await this.prisma.beerStyle.create({
        data: {
          ...createBeerStyleDto,
          averageTemperature,
        },
      });

      return new ResponseEntity(new BeerStyleEntity(newBeerStyle));
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'A beer style with this name already exists.',
        );
      }
      throw error;
    }
  }

  /**
   * Returns a list of all beer styles.
   * @param query The query parameters for filtering, sorting, and pagination.
   * @returns A paginated response entity containing beer style entities.
   * @throws {NotFoundException} If no beer styles are found.
   */
  async findAll(
    query: QueryBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity[]>> {
    const { sortBy } = query;
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const where = parseWhere<Prisma.BeerStyleWhereInput>(query, FILTER_CONFIG);
    const orderBy = parseOrderBy(sortBy, ALLOWED_SORT_FIELDS, 'name');

    const [beerStyles, total] = await this.prisma.$transaction([
      this.prisma.beerStyle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.beerStyle.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const data = beerStyles.map((style) => new BeerStyleEntity(style));
    const meta = { total, page, limit, totalPages };

    return new ResponseEntity<BeerStyleEntity[]>(data, meta);
  }

  /**
   * Finds a single beer style by its ID.
   * @param id The ID of the beer style to be found.
   * @returns The found beer style entity.
   * @throws {NotFoundException} If the style with the provided ID is not found.
   */
  async findOne(id: number): Promise<ResponseEntity<BeerStyleEntity>> {
    const beerStyle = await this.findStyleById(id);

    return new ResponseEntity<BeerStyleEntity>(new BeerStyleEntity(beerStyle));
  }

  /**
   * Updates an existing beer style.
   * @param id The ID of the beer style to be updated.
   * @param updateBeerStyleDto The data to be updated.
   * @returns The updated beer style entity.
   * @throws {NotFoundException} If the style with the provided ID is not found.
   */
  async update(
    id: number,
    updateBeerStyleDto: UpdateBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    const beerStyle = await this.findStyleById(id);

    const minTemperature =
      updateBeerStyleDto.minTemperature ?? beerStyle.minTemperature;
    const maxTemperature =
      updateBeerStyleDto.maxTemperature ?? beerStyle.maxTemperature;
    const averageTemperature =
      (Number(minTemperature) + Number(maxTemperature)) / 2;

    const updatedBeerStyle = await this.prisma.beerStyle.update({
      where: { id },
      data: {
        ...updateBeerStyleDto,
        averageTemperature,
      },
    });

    return new ResponseEntity<BeerStyleEntity>(
      new BeerStyleEntity(updatedBeerStyle),
    );
  }

  /**
   * Removes a beer style from the database.
   * @param id The ID of the beer style to be removed.
   * @returns The beer style entity that was removed.
   * @throws {NotFoundException} If the style with the provided ID is not found.
   */
  async remove(id: number): Promise<ResponseEntity<void>> {
    await this.findStyleById(id);

    await this.prisma.beerStyle.delete({
      where: { id },
    });

    return new ResponseEntity<void>(undefined);
  }

  /**
   * Finds a beer style by its ID or throws a NotFoundException if not found.
   * @param id The ID of the beer style.
   * @returns The found beer style.
   * @throws {NotFoundException} If the style with the provided ID is not found.
   */
  private async findStyleById(id: number): Promise<BeerStyle> {
    const beerStyle = await this.prisma.beerStyle.findUnique({
      where: { id },
    });

    if (!beerStyle) {
      throw new NotFoundException(`BeerStyle with ID #${id} not found`);
    }

    return beerStyle;
  }

  /**
   * Finds the beer style(s) whose average temperature is closest to the provided temperature.
   * @param temp The temperature to match against beer styles.
   * @returns An array of beer style entities that best match the temperature.
   */
  async findBestMatchByTemperature(temp: number): Promise<BeerStyleEntity[]> {
    const allStyles = await this.prisma.beerStyle.findMany({
      select: { averageTemperature: true },
    });

    if (allStyles.length === 0) {
      return [];
    }

    const minDifference = allStyles.reduce((min, style) => {
      const difference = Math.abs(temp - Number(style.averageTemperature));
      return difference < min ? difference : min;
    }, Infinity);

    const bestMatches = await this.prisma.beerStyle.findMany({
      where: {
        averageTemperature: {
          gte: temp - minDifference,
          lte: temp + minDifference,
        },
      },
    });

    const finalMatches = bestMatches.filter(
      (style) =>
        Math.abs(temp - Number(style.averageTemperature)) === minDifference,
    );

    return finalMatches.map((style) => new BeerStyleEntity(style));
  }
}
