import { Test, TestingModule } from '@nestjs/testing';
import { BreweriesService } from './breweries.service';
import { PrismaService } from 'libs/core';
import { BreweryEntity, CreateBreweryDto, UpdateBreweryDto } from 'libs/common';

const mockPrismaService = {
  brewery: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const createBreweryDto: CreateBreweryDto = {
  name: 'Test Brewery Co.',
};

const singleBrewery = {
  id: 1,
  name: 'Test Brewery Co.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const breweriesArray = [
  singleBrewery,
  {
    id: 2,
    name: 'Another Brewery',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('BreweriesService', () => {
  let service: BreweriesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreweriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BreweriesService>(BreweriesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new brewery', async () => {
      prisma.brewery.create.mockResolvedValue(singleBrewery);

      const result = await service.create(createBreweryDto);

      expect(prisma.brewery.create).toHaveBeenCalledWith({
        data: createBreweryDto,
      });
      expect(result.data).toBeInstanceOf(BreweryEntity);
      expect(result.data.name).toEqual(createBreweryDto.name);
    });

    it('should throw an Error if brewery name already exists', async () => {
      prisma.brewery.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createBreweryDto)).rejects.toThrow(
        'Brewery with this name already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of breweries', async () => {
      prisma.$transaction.mockResolvedValue([
        breweriesArray,
        breweriesArray.length,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.data).toHaveLength(breweriesArray.length);
      expect(result.data[0]).toBeInstanceOf(BreweryEntity);
      expect(result.meta?.total).toBe(breweriesArray.length);
      expect(result.meta?.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single brewery by ID', async () => {
      prisma.brewery.findUnique.mockResolvedValue(singleBrewery);

      const result = await service.findOne(1);

      expect(prisma.brewery.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.data).toBeInstanceOf(BreweryEntity);
      expect(result.data.id).toEqual(1);
    });

    it('should throw an Error if brewery is not found', async () => {
      prisma.brewery.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        'Brewery with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a brewery successfully', async () => {
      const updateDto: UpdateBreweryDto = { name: 'Update Brewery' };
      const updatedBrewery = { ...singleBrewery, ...updateDto };

      prisma.brewery.findUnique.mockResolvedValue(singleBrewery);
      prisma.brewery.update.mockResolvedValue(updatedBrewery);

      const result = await service.update(1, updateDto);

      expect(prisma.brewery.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result.data.name).toEqual(updateDto.name);
    });

    it('should throw an Error when trying to update a non-existent brewery', async () => {
      prisma.brewery.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(
        'Brewery with ID 999 not found',
      );
      expect(prisma.brewery.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a brewery successfully', async () => {
      prisma.brewery.findUnique.mockResolvedValue(singleBrewery);
      prisma.brewery.delete.mockResolvedValue(singleBrewery);

      const result = await service.remove(1);

      expect(prisma.brewery.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.data).toBeUndefined();
    });

    it('should throw an Error when trying to remove a non-existent brewery', async () => {
      prisma.brewery.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(
        'Brewery with ID 999 not found',
      );
      expect(prisma.brewery.delete).not.toHaveBeenCalled();
    });
  });
});
