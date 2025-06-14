import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BeerPairingEntity,
  BeerStyleEntity,
  ResponseEntity,
} from 'libs/common';
import { SpotifyService, SpotifyPlaylist } from './modules';

/**
 * Service responsible for providing beer style pairings based on temperature,
 * integrating with the beer-catalog microservice and Spotify playlists.
 */
@Injectable()
export class BeerMachineService {
  private readonly logger = new Logger(BeerMachineService.name);

  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
    private readonly spotifyService: SpotifyService,
  ) {}

  /**
   * Gets the best beer style pairing for a given temperature, including a Spotify playlist suggestion.
   * @param temperature The temperature in Celsius to find the best beer style for.
   * @returns A response entity containing the beer pairing entity.
   * @throws {NotFoundException} If no suitable beer style is found for the given temperature.
   */
  async getBeerPairing(
    temperature: number,
  ): Promise<ResponseEntity<BeerPairingEntity>> {
    this.logger.log(
      `Requesting best beer style for ${temperature}°C from beer-catalog...`,
    );

    const response$ = this.beerCatalogClient.send<
      ResponseEntity<BeerStyleEntity[]>
    >({ cmd: 'find_best_style_by_temp' }, { temperature });
    const response = await firstValueFrom(response$);
    const bestFitStyles = response.data;

    if (!bestFitStyles || bestFitStyles.length === 0) {
      throw new NotFoundException(
        `No suitable beer style found for temperature ${temperature}°C.`,
      );
    }

    if (bestFitStyles.length > 1) {
      bestFitStyles.sort((a, b) => a.name.localeCompare(b.name));
    }

    const bestStyle = bestFitStyles[0];

    this.logger.log(
      `Best style found: ${bestStyle.name}. Searching for playlist...`,
    );

    let playlist: SpotifyPlaylist | null = null;
    try {
      playlist = await this.spotifyService.searchPlaylist(bestStyle.name);
    } catch (error) {
      this.logger.error(
        `Failed to fetch playlist for style "${bestStyle.name}". Proceeding without a playlist.`,
        error.stack,
      );
    }

    const beerPairingEntity = {
      beerStyle: bestStyle.name,
      playlist: playlist,
    };

    return new ResponseEntity(
      new BeerPairingEntity(beerPairingEntity),
      undefined,
    );
  }
}
