import { Test, TestingModule } from '@nestjs/testing';
import { BeerStylesController } from './beer-styles.controller';
import { BeerStylesService } from './beer-styles.service';
import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { ResponseEntity } from 'libs/common';
import { BeerStyleEntity } from 'libs/common/entities/beer-styles/beer-style.entity';

describe('BeerStylesController', () => {
  let controller: BeerStylesController;
  let service: BeerStylesService;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findBestMatchByTemperature: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeerStylesController],
      providers: [{ provide: BeerStylesService, useValue: serviceMock }],
    }).compile();
    controller = module.get<BeerStylesController>(BeerStylesController);
    service = module.get<BeerStylesService>(BeerStylesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a beer style', async () => {
    const beerStyle: BeerStyleEntity = {
      id: 1,
      name: 'Lager',
      minTemperature: 2,
      maxTemperature: 6,
      averageTemperature: 4,
      description: 'Leve',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity(beerStyle);
    jest.spyOn(service, 'create').mockResolvedValue(expected);
    expect(await controller.create({ name: 'Lager' } as any)).toBe(expected);
    expect(service.create).toHaveBeenCalledWith({ name: 'Lager' });
  });

  it('should throw RpcException on create error', async () => {
    const dto = { name: 'Lager' };
    jest
      .spyOn(service, 'create')
      .mockRejectedValue(new HttpException('error', 409));
    await expect(controller.create(dto as any)).rejects.toThrow(RpcException);
  });

  it('should find all beer styles', async () => {
    const beerStyle: BeerStyleEntity = {
      id: 1,
      name: 'Lager',
      minTemperature: 2,
      maxTemperature: 6,
      averageTemperature: 4,
      description: 'Leve',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity([beerStyle]);
    jest.spyOn(service, 'findAll').mockResolvedValue(expected);
    expect(await controller.findAll({ name: 'Lager' } as any)).toBe(expected);
    expect(service.findAll).toHaveBeenCalledWith({ name: 'Lager' });
  });

  it('should find one beer style', async () => {
    const beerStyle: BeerStyleEntity = {
      id: 1,
      name: 'Lager',
      minTemperature: 2,
      maxTemperature: 6,
      averageTemperature: 4,
      description: 'Leve',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity(beerStyle);
    jest.spyOn(service, 'findOne').mockResolvedValue(expected);
    expect(await controller.findOne(1)).toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw RpcException on findOne error', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValue(new HttpException('not found', 404));
    await expect(controller.findOne(1)).rejects.toThrow(RpcException);
  });

  it('should update a beer style', async () => {
    const beerStyle: BeerStyleEntity = {
      id: 1,
      name: 'Lager',
      minTemperature: 2,
      maxTemperature: 6,
      averageTemperature: 4,
      description: 'Leve',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const payload = { id: 1, updateDto: { name: 'Lager' } };
    const expected = new ResponseEntity(beerStyle);
    jest.spyOn(service, 'update').mockResolvedValue(expected);
    expect(await controller.update(payload as any)).toBe(expected);
    expect(service.update).toHaveBeenCalledWith(payload.id, payload.updateDto);
  });

  it('should throw RpcException on update error', async () => {
    const payload = { id: 1, updateDto: { name: 'Lager' } };
    jest
      .spyOn(service, 'update')
      .mockRejectedValue(new HttpException('not found', 404));
    await expect(controller.update(payload as any)).rejects.toThrow(
      RpcException,
    );
  });

  it('should remove a beer style', async () => {
    jest
      .spyOn(service, 'remove')
      .mockResolvedValue(new ResponseEntity(undefined));
    expect(await controller.remove(1)).toBeInstanceOf(ResponseEntity);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should throw RpcException on remove error', async () => {
    jest
      .spyOn(service, 'remove')
      .mockRejectedValue(new HttpException('not found', 404));
    await expect(controller.remove(1)).rejects.toThrow(RpcException);
  });

  it('should find best style by temperature', async () => {
    const beerStyle: BeerStyleEntity = {
      id: 1,
      name: 'Lager',
      minTemperature: 2,
      maxTemperature: 6,
      averageTemperature: 4,
      description: 'Leve',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const best = [beerStyle];
    jest.spyOn(service, 'findBestMatchByTemperature').mockResolvedValue(best);
    const result = await controller.findBestByTemp(10);
    expect(service.findBestMatchByTemperature).toHaveBeenCalledWith(10);
    expect(result.data).toBe(best);
  });
});
