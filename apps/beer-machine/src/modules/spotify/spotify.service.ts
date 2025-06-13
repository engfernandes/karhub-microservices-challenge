import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyPlaylist {
  name: string;
  url: string;
  imageUrl?: string;
  owner?: string;
  tracks?: {
    href: string;
    total: number;
  };
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.clientId = this.configService.get<string>(
      'SPOTIFY_CLIENT_ID',
    ) as string;
    this.clientSecret = this.configService.get<string>(
      'SPOTIFY_CLIENT_SECRET',
    ) as string;

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials are not configured in .env file.');
    }
  }

  /**
   * Searches for a playlist on Spotify that contains the query term.
   * @param query The name of the beer style (or any search term).
   * @returns The first playlist found or null if none is found.
   */
  async searchPlaylist(query: string): Promise<SpotifyPlaylist | null> {
    const cacheKey = `spotify:playlist:${query}`;

    try {
      const cachedPlaylist =
        await this.cacheManager.get<SpotifyPlaylist>(cacheKey);

      if (cachedPlaylist) {
        this.logger.log(`Found cached playlist for query: "${query}"`);
        return cachedPlaylist;
      }

      const token = await this.getValidToken();

      const searchUrl = 'https://api.spotify.com/v1/search';
      const params = new URLSearchParams({
        q: query,
        type: 'playlist',
        limit: '3',
      });

      const response = await firstValueFrom(
        this.httpService.get(`${searchUrl}?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const playlists = response.data?.playlists?.items || [];
      if (playlists.length === 0) {
        this.logger.warn(`No Spotify playlists found for query: "${query}"`);
        return null;
      }

      const validPlaylist = playlists?.find((playlist) =>
        playlist?.name.toLowerCase().includes(query.toLowerCase()),
      );

      if (!validPlaylist) {
        this.logger.warn(`No Spotify playlist found for query: "${query}"`);
        return null;
      }

      const playlistData: SpotifyPlaylist = {
        name: validPlaylist.name,
        owner: validPlaylist.owner?.display_name,
        url: validPlaylist.external_urls?.spotify,
        imageUrl: validPlaylist.images?.[0]?.url,
        tracks: {
          href: validPlaylist.tracks?.href,
          total: validPlaylist.tracks?.total,
        },
      };

      await this.cacheManager.set(cacheKey, playlistData, 60 * 5); // Cache for 5 minutes
      this.logger.log(`Cached Spotify playlist for query: "${query}"`);

      return playlistData;
    } catch (error) {
      this.logger.error(
        `Failed to search Spotify playlist for query: "${query}"`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to communicate with Spotify API.',
      );
    }
  }

  /**
   * Gets a valid access token, either from cache or by fetching a new one.
   * @returns The access token.
   */
  private async getValidToken(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>(
      'spotify:access_token',
    );
    const cachedExpiration = await this.cacheManager.get<number>(
      'spotify:token_expiration',
    );
    if (cachedToken && cachedExpiration && Date.now() < cachedExpiration) {
      return cachedToken;
    }
    this.logger.log(
      'Access token is invalid or expired. Fetching a new one...',
    );
    return this.fetchNewToken();
  }

  /**
   * Fetches a new access token from the Spotify API (Client Credentials Flow).
   * @returns The new access token.
   */
  private async fetchNewToken(): Promise<string> {
    const authUrl = 'https://accounts.spotify.com/api/token';
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    try {
      const response = await firstValueFrom(
        this.httpService.post<SpotifyTokenResponse>(
          authUrl,
          'grant_type=client_credentials',
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${credentials}`,
            },
          },
        ),
      );

      const { access_token, expires_in } = response.data;
      const expirationTime = Date.now() + (expires_in - 300) * 1000;
      await this.cacheManager.set(
        'spotify:access_token',
        access_token,
        expires_in - 300,
      );
      await this.cacheManager.set(
        'spotify:token_expiration',
        expirationTime,
        expires_in - 300,
      );
      this.logger.log('Successfully fetched a new Spotify access token.');
      return access_token;
    } catch (error) {
      this.logger.error('Failed to fetch Spotify access token', error.stack);
      throw new InternalServerErrorException(
        'Could not authenticate with Spotify.',
      );
    }
  }
}
