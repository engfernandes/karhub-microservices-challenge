import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BeerPairingEntity,
  BeerStyleEntity,
  ResponseEntity,
} from 'libs/common';
import { SpotifyService, SpotifyPlaylist } from './modules/spotify';

@Injectable()
export class BeerMachineService {
  private readonly logger = new Logger(BeerMachineService.name);

  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
    private readonly spotifyService: SpotifyService,
  ) {}

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
    let bestFitStyles = response.data;

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
