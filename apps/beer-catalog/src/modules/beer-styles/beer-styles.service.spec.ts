import { Test, TestingModule } from '@nestjs/testing';
import { BeerStylesService } from './beer-styles.service';
import { PrismaService } from 'libs/core'; // Ajuste o caminho conforme necessário
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  BeerStyleEntity,
  CreateBeerStyleDto,
  UpdateBeerStyleDto,
} from 'libs/common'; // Ajuste o caminho conforme necessário
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock completo do PrismaService. Cada função que o seu service usa é substituída
// por uma função mock do Jest (jest.fn()), permitindo-nos controlar o que ela retorna em cada teste.
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

// --- DADOS MOCK PARA OS TESTES ---

// O DTO simula os dados brutos que chegam à API, usando tipos primitivos de JavaScript.
const createBeerStyleDto: CreateBeerStyleDto = {
  name: 'Test IPA',
  description: 'A hoppy test beer',
  minTemperature: -7,
  maxTemperature: 10,
};

// A entidade simula o que o Prisma retorna do banco de dados, usando os tipos corretos do Prisma (Decimal).
const singleBeerStyle: BeerStyleEntity = {
  id: 1,
  name: 'Test IPA',
  description: 'A hoppy test beer',
  minTemperature: -7,
  maxTemperature: 10,
  averageTemperature: 1.5, // Média: (10 + -7) / 2 = 1.5
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Lista de cervejas para testar buscas e a lógica de recomendação.
const beerStylesArray: BeerStyleEntity[] = [
  singleBeerStyle,
  new BeerStyleEntity({
    id: 2,
    name: 'Pilsen',
    description: 'A light lager',
    minTemperature: new Decimal(-2),
    maxTemperature: new Decimal(4),
    averageTemperature: new Decimal(1.0),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new BeerStyleEntity({
    id: 3,
    name: 'Imperial Stout',
    description: 'A dark and strong ale',
    minTemperature: new Decimal(-10),
    maxTemperature: new Decimal(13),
    averageTemperature: new Decimal(1.5), // Empate com a Test IPA
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];

// --- SUÍTE DE TESTES ---

describe('BeerStylesService', () => {
  let service: BeerStylesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    // Configura um módulo de teste do NestJS antes de cada teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeerStylesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Usamos nosso mock em vez do Prisma real
        },
      ],
    }).compile();

    service = module.get<BeerStylesService>(BeerStylesService);
    prisma = module.get(PrismaService);

    // Limpa o histórico de chamadas dos mocks antes de cada teste para garantir a isolação
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Testes para o método create
  describe('create', () => {
    it('should create a new beer style and calculate average temperature', async () => {
      prisma.beerStyle.create.mockResolvedValue(singleBeerStyle);

      const result = await service.create(createBeerStyleDto);

      expect(prisma.beerStyle.create).toHaveBeenCalledWith({
        data: {
          ...createBeerStyleDto,
          averageTemperature: 1.5, // O ponto crucial: verifica se a média foi calculada
        },
      });
      expect(result.data).toEqual(singleBeerStyle);
    });

    it('should throw a ConflictException if beer style name already exists', async () => {
      prisma.beerStyle.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2002', // Código de erro do Prisma para violação de chave única
          clientVersion: 'test',
        }),
      );

      await expect(service.create(createBeerStyleDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // Testes para o método findAll
  describe('findAll', () => {
    it('should return a paginated list of beer styles', async () => {
      prisma.$transaction.mockResolvedValue([
        beerStylesArray,
        beerStylesArray.length,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.data).toEqual(beerStylesArray);
      expect(result?.meta?.total).toBe(beerStylesArray.length);
      expect(result?.meta?.page).toBe(1);
      expect(result?.meta?.totalPages).toBe(1);
    });
  });

  // Testes para o método findOne
  describe('findOne', () => {
    it('should return a single beer style by ID', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(singleBeerStyle);

      const result = await service.findOne(1);

      expect(prisma.beerStyle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.data).toEqual(singleBeerStyle);
    });

    it('should throw a NotFoundException if beer style is not found', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // Testes para o método update
  describe('update', () => {
    it('should update a beer style and recalculate average temperature', async () => {
      const updateDto: UpdateBeerStyleDto = { maxTemperature: 12 };
      const updatedStyle = {
        ...singleBeerStyle,
        maxTemperature: 12,
        averageTemperature: 2.5,
      };

      prisma.beerStyle.findUnique.mockResolvedValue(singleBeerStyle);
      prisma.beerStyle.update.mockResolvedValue(updatedStyle);

      const result = await service.update(1, updateDto);

      expect(prisma.beerStyle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...updateDto,
          averageTemperature: 2.5, // Verifica se a média foi recalculada: (-7 + 12) / 2 = 2.5
        },
      });
      expect(result.data).toEqual(updatedStyle);
    });

    it('should throw a NotFoundException when trying to update a non-existent style', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  // Testes para o método remove
  describe('remove', () => {
    it('should remove a beer style successfully', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(singleBeerStyle);
      prisma.beerStyle.delete.mockResolvedValue(singleBeerStyle);

      await service.remove(1);

      expect(prisma.beerStyle.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw a NotFoundException when trying to remove a non-existent style', async () => {
      prisma.beerStyle.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.beerStyle.delete).not.toHaveBeenCalled();
    });
  });

  // Testes para a lógica principal: findBestMatchByTemperature
  describe('findBestMatchByTemperature', () => {
    beforeEach(() => {
      // Para todos os testes neste describe, o findMany retornará nossa lista mock.
      // A lógica de filtragem e busca acontecerá em memória no nosso service.
      prisma.beerStyle.findMany.mockResolvedValue(beerStylesArray as any);
    });

    it('should return the single best style for a given temperature', async () => {
      // Para a temp 0, Pilsen (média 1.0) é o mais próximo (diferença de 1)
      const temp = 0;
      const result = await service.findBestMatchByTemperature(temp);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pilsen');
    });

    it('should return all tied styles for a given temperature', async () => {
      // Para a temp 2, IPA e Imperial Stout (ambos com média 1.5) são os mais próximos (diferença de 0.5)
      const temp = 2;
      const result = await service.findBestMatchByTemperature(temp);

      // O service deve retornar AMBOS os estilos empatados.
      expect(result).toHaveLength(2);
      const names = result.map((r) => r.name);
      expect(names).toContain('Test IPA');
      expect(names).toContain('Imperial Stout');
    });

    it('should return an empty array if no beer styles exist', async () => {
      prisma.beerStyle.findMany.mockResolvedValue([]); // Sobrescreve o mock do beforeEach
      const result = await service.findBestMatchByTemperature(5);
      expect(result).toEqual([]);
    });
  });
});
