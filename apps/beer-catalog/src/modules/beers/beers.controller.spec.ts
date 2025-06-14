import { Test, TestingModule } from '@nestjs/testing';
import { BeersController } from './beers.controller';
import { BeersService } from './beers.service';
import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { ResponseEntity } from 'libs/common';
import { BeerEntity } from 'libs/common/entities/beers/beer.entity';

describe('BeersController', () => {
  let controller: BeersController;
  let service: BeersService;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeersController],
      providers: [{ provide: BeersService, useValue: serviceMock }],
    }).compile();
    controller = module.get<BeersController>(BeersController);
    service = module.get<BeersService>(BeersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a beer', async () => {
    const beer: BeerEntity = {
      id: 1,
      name: 'IPA',
      abv: 5,
      styleId: 1,
      breweryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity(beer);
    jest.spyOn(service, 'create').mockResolvedValue(expected);
    expect(await controller.create({ name: 'IPA' } as any)).toBe(expected);
    expect(service.create).toHaveBeenCalledWith({ name: 'IPA' });
  });

  it('should throw RpcException on create error', async () => {
    const dto = { name: 'IPA' };
    jest
      .spyOn(service, 'create')
      .mockRejectedValue(new HttpException('error', 409));
    await expect(controller.create(dto as any)).rejects.toThrow(RpcException);
  });

  it('should find all beers', async () => {
    const beer: BeerEntity = {
      id: 1,
      name: 'IPA',
      abv: 5,
      styleId: 1,
      breweryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity([beer]);
    jest.spyOn(service, 'findAll').mockResolvedValue(expected);
    expect(await controller.findAll({ name: 'IPA' } as any)).toBe(expected);
    expect(service.findAll).toHaveBeenCalledWith({ name: 'IPA' });
  });

  it('should find one beer', async () => {
    const beer: BeerEntity = {
      id: 1,
      name: 'IPA',
      abv: 5,
      styleId: 1,
      breweryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity(beer);
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

  it('should update a beer', async () => {
    const beer: BeerEntity = {
      id: 1,
      name: 'IPA',
      abv: 5,
      styleId: 1,
      breweryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const payload = { id: 1, updateDto: { name: 'IPA' } };
    const expected = new ResponseEntity(beer);
    jest.spyOn(service, 'update').mockResolvedValue(expected);
    expect(await controller.update(payload as any)).toBe(expected);
    expect(service.update).toHaveBeenCalledWith(payload.id, payload.updateDto);
  });

  it('should throw RpcException on update error', async () => {
    const payload = { id: 1, updateDto: { name: 'IPA' } };
    jest
      .spyOn(service, 'update')
      .mockRejectedValue(new HttpException('not found', 404));
    await expect(controller.update(payload as any)).rejects.toThrow(
      RpcException,
    );
  });

  it('should remove a beer', async () => {
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
});
