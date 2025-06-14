import { Test, TestingModule } from '@nestjs/testing';
import { BeerMachineController } from './beer-machine.controller';
import { BeerMachineService } from './beer-machine.service';
import { RpcException } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { ResponseEntity } from 'libs/common';
import { BeerPairingEntity } from 'libs/common/entities/beer-machine/beer-pairing.entity';
import { SpotifyPlaylist } from './modules/spotify/spotify.service';

describe('BeerMachineController', () => {
  let controller: BeerMachineController;
  let service: BeerMachineService;

  beforeEach(async () => {
    const serviceMock = {
      getBeerPairing: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeerMachineController],
      providers: [{ provide: BeerMachineService, useValue: serviceMock }],
    }).compile();
    controller = module.get<BeerMachineController>(BeerMachineController);
    service = module.get<BeerMachineService>(BeerMachineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return beer pairing for valid temperature', async () => {
    const playlist: SpotifyPlaylist = {
      name: 'Chill Vibes',
      url: 'https://open.spotify.com/playlist/123',
      imageUrl: 'https://i.scdn.co/image/ab67616d0000b273123',
      owner: 'Spotify',
      tracks: {
        href: 'https://api.spotify.com/v1/playlists/123/tracks',
        total: 50,
      },
    };
    const beerPairing = new BeerPairingEntity({ beerStyle: 'IPA', playlist });
    const expected = new ResponseEntity(beerPairing);
    jest.spyOn(service, 'getBeerPairing').mockResolvedValue(expected);
    const result = await controller.getBeerPairing({ temperature: 10 });
    expect(service.getBeerPairing).toHaveBeenCalledWith(10);
    expect(result).toBe(expected);
    expect(result.data).toBe(beerPairing);
  });

  it('should throw RpcException if service throws HttpException', async () => {
    jest
      .spyOn(service, 'getBeerPairing')
      .mockRejectedValue(new HttpException('not found', 404));
    await expect(
      controller.getBeerPairing({ temperature: 10 }),
    ).rejects.toThrow(RpcException);
  });

  it('should rethrow non-HttpException errors', async () => {
    jest
      .spyOn(service, 'getBeerPairing')
      .mockRejectedValue(new Error('other error'));
    await expect(
      controller.getBeerPairing({ temperature: 10 }),
    ).rejects.toThrow('other error');
  });
});
