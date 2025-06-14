import { Test, TestingModule } from '@nestjs/testing';
import { BeerStylesController } from './beer-styles.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { CacheModule } from '@nestjs/cache-manager';

describe('BeerStylesController', () => {
  let controller: BeerStylesController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const clientProxyMock = {
      send: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [BeerStylesController],
      providers: [
        {
          provide: 'BEER_CATALOG_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    controller = module.get<BeerStylesController>(BeerStylesController);
    clientProxy = module.get<ClientProxy>('BEER_CATALOG_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct payload', async () => {
    const dto = { name: 'Lager' };
    const expected = { data: { id: 1, name: 'Lager' } };
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(expected));
    const result = await controller.create(dto as any);
    expect(clientProxy.send).toHaveBeenCalledWith(
      { cmd: 'create_beer_style' },
      dto,
    );
    expect(result).toEqual(expected);
  });

  it('should call findAll with correct query', async () => {
    const query = { name: 'Lager' };
    const expected = { data: [] };
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(expected));
    const result = await controller.findAll(query as any);
    expect(clientProxy.send).toHaveBeenCalledWith(
      { cmd: 'find_all_beer_styles' },
      query,
    );
    expect(result).toEqual(expected);
  });

  it('should call findOne with correct id', async () => {
    const expected = { data: { id: 1, name: 'Lager' } };
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(expected));
    const result = await controller.findOne(1);
    expect(clientProxy.send).toHaveBeenCalledWith(
      { cmd: 'find_one_beer_style' },
      1,
    );
    expect(result).toEqual(expected);
  });

  it('should call update with correct payload', async () => {
    const dto = { name: 'Lager' };
    const expected = { data: { id: 1, name: 'Lager' } };
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(expected));
    const result = await controller.update(1, dto as any);
    expect(clientProxy.send).toHaveBeenCalledWith(
      { cmd: 'update_beer_style' },
      { id: 1, updateDto: dto },
    );
    expect(result).toEqual(expected);
  });

  it('should call remove with correct id', async () => {
    jest.spyOn(clientProxy, 'send').mockReturnValue(of(undefined));
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(clientProxy.send).toHaveBeenCalledWith(
      { cmd: 'remove_beer_style' },
      1,
    );
  });
});
