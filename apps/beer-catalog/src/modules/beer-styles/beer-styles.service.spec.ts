import { Test, TestingModule } from '@nestjs/testing';
import { BeerStylesService } from './beer-styles.service';
import { PrismaService } from 'libs/core';
import {
  CreateBeerStyleDto,
  QueryBeerStyleDto,
  UpdateBeerStyleDto,
} from './dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BeerStyleEntity } from './entities';
import { ResponseEntity } from 'libs/common';
import * as utils from 'libs/common/utils';

jest.mock('libs/common/utils', () => ({
  ...jest.requireActual('libs/common/utils'),
  parseWhere: jest.fn(),
  parseOrderBy: jest.fn(),
}));

const mockPrismaService = {
  beerStyle: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const beerStyleExample = {
  id: 1,
  name: 'India Pale Ale',
  minTemperature: -7.0,
  maxTemperature: 10.0,
  description: 'Uma cerveja amarga e lupulada.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BeerStylesService', () => {
  let service: BeerStylesService;
  let prisma: jest.Mocked<typeof mockPrismaService>;
  let parseWhereMock: jest.Mock;
  let parseOrderByMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeerStylesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BeerStylesService>(BeerStylesService);
    prisma = module.get(PrismaService);
    parseWhereMock = utils.parseWhere as jest.Mock;
    parseOrderByMock = utils.parseOrderBy as jest.Mock;

    prisma.$transaction.mockImplementation((promises) => Promise.all(promises));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new beer style and return it in a ResponseEntity', async () => {
      const createDto: CreateBeerStyleDto = { name: 'Pilsen' };
      prisma.beerStyle.create.mockResolvedValue(beerStyleExample);

      const result = await service.create(createDto);

      expect(result).toBeInstanceOf(ResponseEntity);
      expect(result.data).toBeInstanceOf(BeerStyleEntity);
      expect(result.data.id).toBe(beerStyleExample.id);
      expect(prisma.beerStyle.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw ConflictException if beer style name already exists', async () => {
      const createDto: CreateBeerStyleDto = { name: 'Pilsen' };
      const prismaError = { code: 'P2002' };
      prisma.beerStyle.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of beer styles', async () => {
      const queryDto: QueryBeerStyleDto = { page: 1, limit: 10 };
      parseWhereMock.mockReturnValue({});
      parseOrderByMock.mockReturnValue({ name: 'asc' });
      prisma.beerStyle.findMany.mockResolvedValue([beerStyleExample]);
      prisma.beerStyle.count.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result).toBeInstanceOf(ResponseEntity);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(BeerStyleEntity);
      expect(result?.meta?.total).toBe(1);
      expect(result?.meta?.page).toBe(1);
      expect(prisma.beerStyle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single beer style in a ResponseEntity', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(beerStyleExample);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(ResponseEntity);
      expect(result.data).toBeInstanceOf(BeerStyleEntity);
      expect(result.data.id).toBe(1);
      expect(prisma.beerStyle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if beer style is not found', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a beer style and return the updated entity', async () => {
      const updateDto: UpdateBeerStyleDto = { description: 'Updated!' };
      const updatedBeerStyle = { ...beerStyleExample, ...updateDto };
      prisma.beerStyle.findUnique.mockResolvedValue(beerStyleExample);
      prisma.beerStyle.update.mockResolvedValue(updatedBeerStyle);

      const result = await service.update(1, updateDto);

      expect(prisma.beerStyle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.beerStyle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toBeInstanceOf(ResponseEntity);
      expect(result.data.description).toBe('Updated!');
    });

    it('should throw NotFoundException if trying to update a non-existent style', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
      expect(prisma.beerStyle.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a beer style and return an empty ResponseEntity', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(beerStyleExample);
      prisma.beerStyle.delete.mockResolvedValue(beerStyleExample);

      const result = await service.remove(1);

      expect(prisma.beerStyle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.beerStyle.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBeInstanceOf(ResponseEntity);
      expect(result.data).toBeUndefined();
    });

    it('should throw NotFoundException if trying to remove a non-existent style', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.beerStyle.delete).not.toHaveBeenCalled();
    });
  });
});
