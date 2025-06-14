import { Test, TestingModule } from '@nestjs/testing';
import { BeerMachineService } from './beer-machine.service';
import { ClientProxy } from '@nestjs/microservices';
import { SpotifyService, SpotifyPlaylist } from './modules/spotify';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { BeerStyleEntity, ResponseEntity } from 'libs/common';
import { Decimal } from '@prisma/client/runtime/library';

const mockBeerCatalogClient = {
  send: jest.fn(),
};

const mockSpotifyService = {
  searchPlaylist: jest.fn(),
};

const singleBeerStyle = new BeerStyleEntity({
  id: 1,
  name: 'IPA',
  averageTemperature: new Decimal(1.5),
} as any);
const tiedBeerStyles = [
  new BeerStyleEntity({ id: 1, name: 'IPA' } as any),
  new BeerStyleEntity({ id: 2, name: 'Imperial Stout' } as any),
];

const mockPlaylist: SpotifyPlaylist = {
  name: 'Hoppy Tunes',
  url: 'https://spotify.com/playlist/hoppy',
  owner: 'DJ Beer',
};

describe('BeerMachineService', () => {
  let service: BeerMachineService;
  let beerCatalogClient: ClientProxy;
  let spotifyService: SpotifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeerMachineService,
        {
          provide: 'BEER_CATALOG_SERVICE',
          useValue: mockBeerCatalogClient,
        },
        {
          provide: SpotifyService,
          useValue: mockSpotifyService,
        },
      ],
    }).compile();

    service = module.get<BeerMachineService>(BeerMachineService);
    beerCatalogClient = module.get<ClientProxy>('BEER_CATALOG_SERVICE');
    spotifyService = module.get<SpotifyService>(SpotifyService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBeerPairing', () => {
    it('should return a beer pairing with a playlist when both are found', async () => {
      mockBeerCatalogClient.send.mockReturnValue(
        of(new ResponseEntity([singleBeerStyle])),
      );
      mockSpotifyService.searchPlaylist.mockResolvedValue(mockPlaylist);

      const result = await service.getBeerPairing(3);

      expect(beerCatalogClient.send).toHaveBeenCalledWith(
        { cmd: 'find_best_style_by_temp' },
        { temperature: 3 },
      );
      expect(spotifyService.searchPlaylist).toHaveBeenCalledWith('IPA');
      expect(result.data.beerStyle).toBe('IPA');
      expect(result.data.playlist).toEqual(mockPlaylist);
    });

    it('should return a beer pairing with a null playlist if none is found', async () => {
      mockBeerCatalogClient.send.mockReturnValue(
        of(new ResponseEntity([singleBeerStyle])),
      );
      mockSpotifyService.searchPlaylist.mockResolvedValue(null);

      const result = await service.getBeerPairing(3);

      expect(spotifyService.searchPlaylist).toHaveBeenCalledWith('IPA');
      expect(result.data.beerStyle).toBe('IPA');
      expect(result.data.playlist).toBeNull();
    });

    it('should correctly choose a style alphabetically in case of a tie', async () => {
      mockBeerCatalogClient.send.mockReturnValue(
        of(new ResponseEntity(tiedBeerStyles)),
      );
      mockSpotifyService.searchPlaylist.mockResolvedValue(mockPlaylist);

      await service.getBeerPairing(2);

      expect(spotifyService.searchPlaylist).toHaveBeenCalledWith(
        'Imperial Stout',
      );
    });

    it('should throw NotFoundException if no suitable beer style is found', async () => {
      mockBeerCatalogClient.send.mockReturnValue(of(new ResponseEntity([])));

      await expect(service.getBeerPairing(99)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getBeerPairing(99)).rejects.toThrow(
        'No suitable beer style found for temperature 99°C.',
      );
      expect(spotifyService.searchPlaylist).not.toHaveBeenCalled();
    });
  });
});
