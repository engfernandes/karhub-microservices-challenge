import { Test, TestingModule } from '@nestjs/testing';
import { BeerMachineController } from './beer-machine.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

describe('BeerMachineController', () => {
  let controller: BeerMachineController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const clientProxyMock = {
      send: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [BeerMachineController],
      providers: [
        {
          provide: 'BEER_MACHINE_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    controller = module.get<BeerMachineController>(BeerMachineController);
    clientProxy = module.get<ClientProxy>('BEER_MACHINE_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return recommendation when found', async () => {
    const query = { temperature: 10 };
    const expected = { beer: 'IPA', playlist: 'Rock' };
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(expected));
    const result = await controller.getBeerPairing(query as any);
    expect(clientProxy.send).toHaveBeenCalledWith(
      { cmd: 'get_beer_pairing' },
      { temperature: query.temperature },
    );
    expect(result).toEqual(expected);
  });

  it('should throw NotFoundException when no recommendation', async () => {
    const query = { temperature: 10 };
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(undefined));
    await expect(controller.getBeerPairing(query as any)).rejects.toThrow(
      NotFoundException,
    );
  });
});
