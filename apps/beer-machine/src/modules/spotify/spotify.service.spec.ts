import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyService, SpotifyPlaylist } from './spotify.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { of } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SPOTIFY_CLIENT_ID') return 'test_client_id';
    if (key === 'SPOTIFY_CLIENT_SECRET') return 'test_client_secret';
    return null;
  }),
};

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockSpotifyTokenResponse: AxiosResponse = {
  data: { access_token: 'mock_token', expires_in: 3600 },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
};

const mockSpotifyPlaylistResponse: AxiosResponse = {
  data: {
    playlists: {
      items: [
        {
          name: 'Awesome IPA Playlist',
          external_urls: { spotify: 'https://spotify.com/playlist/ipa' },
          images: [{ url: 'https://image.url/ipa' }],
          owner: { display_name: 'DJ Beer' },
          tracks: { href: 'https://spotify.com/tracks/ipa', total: 50 },
        },
      ],
    },
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
};

describe('SpotifyService', () => {
  let service: SpotifyService;
  let httpService: HttpService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<SpotifyService>(SpotifyService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchPlaylist', () => {
    it('should return a cached playlist if available', async () => {
      const query = 'IPA';
      const cachedPlaylist: SpotifyPlaylist = {
        name: 'Cached IPA Playlist',
        url: '...',
      };
      mockCacheManager.get.mockResolvedValue(cachedPlaylist);

      const result = await service.searchPlaylist(query);

      expect(result).toEqual(cachedPlaylist);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from Spotify API if not cached, then cache and return the result', async () => {
      const query = 'IPA';
      mockCacheManager.get.mockResolvedValue(null);
      jest
        .spyOn(service as any, 'getValidToken')
        .mockResolvedValue('mock_token');
      mockHttpService.get.mockReturnValue(of(mockSpotifyPlaylistResponse));

      const result = await service.searchPlaylist(query);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Awesome IPA Playlist');
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.spotify.com/v1/search'),
        expect.any(Object),
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        `spotify:playlist:${query}`,
        expect.any(Object),
        expect.any(Number),
      );
    });

    it('should return null if Spotify API finds no playlists', async () => {
      const query = 'NonExistentStyle';
      mockCacheManager.get.mockResolvedValue(null);
      jest
        .spyOn(service as any, 'getValidToken')
        .mockResolvedValue('mock_token');
      mockHttpService.get.mockReturnValue(
        of({ data: { playlists: { items: [] } } } as any),
      );

      const result = await service.searchPlaylist(query);

      expect(result).toBeNull();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on API failure', async () => {
      const query = 'IPA';
      mockCacheManager.get.mockResolvedValue(null);
      jest
        .spyOn(service as any, 'getValidToken')
        .mockResolvedValue('mock_token');
      mockHttpService.get.mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(service.searchPlaylist(query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('Token Management (getValidToken and fetchNewToken)', () => {
    it('should return a cached token if it is valid', async () => {
      mockCacheManager.get
        .mockResolvedValueOnce('cached_token')
        .mockResolvedValueOnce(Date.now() + 10000);

      const token = await (service as any).getValidToken();

      expect(token).toBe('cached_token');
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should fetch a new token if cache is expired', async () => {
      mockCacheManager.get
        .mockResolvedValueOnce('expired_token')
        .mockResolvedValueOnce(Date.now() - 10000);
      mockHttpService.post.mockReturnValue(of(mockSpotifyTokenResponse));

      const token = await (service as any).getValidToken();

      expect(httpService.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.any(String),
        expect.any(Object),
      );
      expect(token).toBe('mock_token');
      expect(cacheManager.set).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerErrorException if fetching a new token fails', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockHttpService.post.mockImplementation(() => {
        throw new Error('Auth Error');
      });

      await expect((service as any).getValidToken()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
