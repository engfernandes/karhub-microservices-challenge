import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyService, SpotifyPlaylist } from './spotify.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InternalServerErrorException } from '@nestjs/common';
import { of } from 'rxjs';

describe('SpotifyService', () => {
  let service: SpotifyService;
  let configService: ConfigService;
  let httpService: HttpService;
  let cacheManager: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'SPOTIFY_CLIENT_ID') return 'test-client-id';
        if (key === 'SPOTIFY_CLIENT_SECRET') return 'test-client-secret';
        return null;
      }),
    } as any;
    httpService = { get: jest.fn(), post: jest.fn() } as any;
    cacheManager = { get: jest.fn(), set: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyService,
        { provide: ConfigService, useValue: configService },
        { provide: HttpService, useValue: httpService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<SpotifyService>(SpotifyService);
  });

  describe('searchPlaylist', () => {
    it('should return cached playlist if available', async () => {
      const playlist: SpotifyPlaylist = {
        name: 'Test Playlist',
        url: 'http://spotify.com/playlist',
        imageUrl: 'http://image.com/img.jpg',
      };
      jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token');
      cacheManager.get = jest.fn().mockResolvedValue(playlist);
      const result = await service.searchPlaylist('rock');
      expect(result).toEqual(playlist);
    });

    it('should fetch playlist from Spotify API if not cached', async () => {
      cacheManager.get = jest.fn().mockResolvedValue(null);
      jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token');
      const playlistData = {
        data: {
          playlists: {
            items: [
              {
                name: 'Test Playlist',
                external_urls: { spotify: 'http://spotify.com/playlist' },
                images: [{ url: 'http://image.com/img.jpg' }],
              },
            ],
          },
        },
      };
      httpService.get = jest.fn().mockReturnValue(of(playlistData));
      cacheManager.set = jest.fn();
      const result = await service.searchPlaylist('rock');
      expect(result).toEqual({
        name: 'Test Playlist',
        url: 'http://spotify.com/playlist',
        imageUrl: 'http://image.com/img.jpg',
      });
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should return null if no playlist found', async () => {
      cacheManager.get = jest.fn().mockResolvedValue(null);
      jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token');
      const playlistData = { data: { playlists: { items: [] } } };
      httpService.get = jest.fn().mockReturnValue(of(playlistData));
      const result = await service.searchPlaylist('unknown');
      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException on error', async () => {
      cacheManager.get = jest.fn().mockResolvedValue(null);
      jest.spyOn(service as any, 'getValidToken').mockResolvedValue('token');
      httpService.get = jest.fn().mockImplementation(() => {
        throw new Error('fail');
      });
      await expect(service.searchPlaylist('fail')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getValidToken', () => {
    it('should return cached token if valid', async () => {
      cacheManager.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'spotify:access_token') return 'token';
        if (key === 'spotify:token_expiration') return Date.now() + 10000;
      });
      const result = await (service as any).getValidToken();
      expect(result).toBe('token');
    });

    it('should fetch new token if not cached or expired', async () => {
      cacheManager.get = jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      const fetchNewTokenSpy = jest
        .spyOn(service as any, 'fetchNewToken')
        .mockResolvedValue('new-token');
      const result = await (service as any).getValidToken();
      expect(fetchNewTokenSpy).toHaveBeenCalled();
      expect(result).toBe('new-token');
    });
  });

  describe('fetchNewToken', () => {
    it('should fetch and cache new token', async () => {
      const response = {
        data: { access_token: 'token', expires_in: 3600 },
      };
      httpService.post = jest.fn().mockReturnValue(of(response));
      cacheManager.set = jest.fn();
      const result = await (service as any).fetchNewToken();
      expect(result).toBe('token');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'spotify:access_token',
        'token',
        3600 - 300,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        'spotify:token_expiration',
        expect.any(Number),
        3600 - 300,
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      httpService.post = jest.fn().mockImplementation(() => {
        throw new Error('fail');
      });
      await expect((service as any).fetchNewToken()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
