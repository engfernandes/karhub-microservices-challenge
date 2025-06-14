import { Test, TestingModule } from '@nestjs/testing';
import { BeersService } from './beers.service';
import { PrismaService } from 'libs/core';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BeerEntity, CreateBeerDto, UpdateBeerDto } from 'libs/common';
import { Prisma, Beer, BeerStyle, Brewery } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const mockPrismaService = {
  beer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockBeerStyle: BeerStyle = {
  id: 1,
  name: 'Test IPA',
  description: 'A hoppy test beer',
  minTemperature: new Decimal(-7),
  maxTemperature: new Decimal(10),
  averageTemperature: new Decimal(1.5),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBrewery: Brewery = {
  id: 1,
  name: 'Test Brewery',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createBeerDto: CreateBeerDto = {
  name: 'Test Beer IPA',
  abv: 7.5,
  styleId: mockBeerStyle.id,
  breweryId: mockBrewery.id,
};

const singleBeer: Beer & { style: BeerStyle; brewery: Brewery } = {
  id: 1,
  name: 'Test Beer IPA',
  abv: new Decimal(7.5),
  styleId: mockBeerStyle.id,
  breweryId: mockBrewery.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  style: mockBeerStyle,
  brewery: mockBrewery,
};

const beersArray = [
  singleBeer,
  {
    ...singleBeer,
    id: 2,
    name: 'Another Test Beer',
    style: { ...mockBeerStyle, name: 'Test Lager' },
  },
];

describe('BeersService', () => {
  let service: BeersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BeersService>(BeersService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new beer successfully', async () => {
      prisma.beer.create.mockResolvedValue(singleBeer);

      const result = await service.create(createBeerDto);

      expect(prisma.beer.create).toHaveBeenCalledWith({
        data: createBeerDto,
      });

      expect(result.data).toBeInstanceOf(BeerEntity);
      expect(result.data.name).toEqual(createBeerDto.name);
    });

    it('should throw a ConflictException if beer name already exists', async () => {
      prisma.beer.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.create(createBeerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of beers', async () => {
      prisma.$transaction.mockResolvedValue([beersArray, beersArray.length]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.data).toHaveLength(beersArray.length);
      expect(result.data[0]).toBeInstanceOf(BeerEntity);
      expect(result.meta?.total).toBe(beersArray.length);
      expect(result.meta?.page).toBe(1);
      expect(result.meta?.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single beer by ID', async () => {
      prisma.beer.findUnique.mockResolvedValue(singleBeer);

      const result = await service.findOne(1);

      expect(prisma.beer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { style: true, brewery: true },
      });
      expect(result.data).toBeInstanceOf(BeerEntity);
      expect(result.data.id).toEqual(1);
    });

    it('should throw a NotFoundException if beer is not found', async () => {
      prisma.beer.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a beer successfully', async () => {
      const updateDto: UpdateBeerDto = { abv: 8.0 };
      const updatedBeer = { ...singleBeer, ...updateDto };

      prisma.beer.findUnique.mockResolvedValue(singleBeer);
      prisma.beer.update.mockResolvedValue(updatedBeer);

      const result = await service.update(1, updateDto);

      expect(prisma.beer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: { style: true, brewery: true },
      });
      expect(result.data.abv).toEqual(updateDto.abv);
    });

    it('should throw a NotFoundException when trying to update a non-existent beer', async () => {
      prisma.beer.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
      expect(prisma.beer.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a beer successfully', async () => {
      prisma.beer.findUnique.mockResolvedValue(singleBeer);
      prisma.beer.delete.mockResolvedValue(singleBeer);

      const result = await service.remove(1);

      expect(prisma.beer.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.data).toBeUndefined();
    });

    it('should throw a NotFoundException when trying to remove a non-existent beer', async () => {
      prisma.beer.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.beer.delete).not.toHaveBeenCalled();
    });
  });
});
