import { Test, TestingModule } from '@nestjs/testing';
import { BreweriesController } from './breweries.controller';
import { BreweriesService } from './breweries.service';
import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { ResponseEntity } from 'libs/common';
import { BreweryEntity } from 'libs/common/entities/breweries/brewery.entity';

describe('BreweriesController', () => {
  let controller: BreweriesController;
  let service: BreweriesService;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BreweriesController],
      providers: [{ provide: BreweriesService, useValue: serviceMock }],
    }).compile();
    controller = module.get<BreweriesController>(BreweriesController);
    service = module.get<BreweriesService>(BreweriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a brewery', async () => {
    const brewery: BreweryEntity = {
      id: 1,
      name: 'Brewery',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity(brewery);
    jest.spyOn(service, 'create').mockResolvedValue(expected);
    expect(await controller.create({ name: 'Brewery' } as any)).toBe(expected);
    expect(service.create).toHaveBeenCalledWith({ name: 'Brewery' });
  });

  it('should throw RpcException on create error', async () => {
    const dto = { name: 'Brewery' };
    jest
      .spyOn(service, 'create')
      .mockRejectedValue(new HttpException('error', 409));
    await expect(controller.create(dto as any)).rejects.toThrow(RpcException);
  });

  it('should find all breweries', async () => {
    const brewery: BreweryEntity = {
      id: 1,
      name: 'Brewery',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity([brewery]);
    jest.spyOn(service, 'findAll').mockResolvedValue(expected);
    expect(await controller.findAll({ name: 'Brewery' } as any)).toBe(expected);
    expect(service.findAll).toHaveBeenCalledWith({ name: 'Brewery' });
  });

  it('should find one brewery', async () => {
    const brewery: BreweryEntity = {
      id: 1,
      name: 'Brewery',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expected = new ResponseEntity(brewery);
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

  it('should update a brewery', async () => {
    const brewery: BreweryEntity = {
      id: 1,
      name: 'Brewery',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const payload = { id: 1, updateDto: { name: 'Brewery' } };
    const expected = new ResponseEntity(brewery);
    jest.spyOn(service, 'update').mockResolvedValue(expected);
    expect(await controller.update(payload as any)).toBe(expected);
    expect(service.update).toHaveBeenCalledWith(payload.id, payload.updateDto);
  });

  it('should throw RpcException on update error', async () => {
    const payload = { id: 1, updateDto: { name: 'Brewery' } };
    jest
      .spyOn(service, 'update')
      .mockRejectedValue(new HttpException('not found', 404));
    await expect(controller.update(payload as any)).rejects.toThrow(
      RpcException,
    );
  });

  it('should remove a brewery', async () => {
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
