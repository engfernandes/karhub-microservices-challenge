import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BeerStyleEntity, ResponseEntity } from 'libs/common';
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
  ): Promise<{ beerStyle: string; playlist: SpotifyPlaylist | null }> {
    this.logger.log('Fetching all beer styles from beer-catalog...');
    const stylesResponse$ = this.beerCatalogClient.send<
      ResponseEntity<BeerStyleEntity[]>
    >({ cmd: 'find_all_beer_styles' }, { limit: 1000 });
    const stylesResponse = await firstValueFrom(stylesResponse$);
    const beerStyles = stylesResponse.data;

    if (!beerStyles || beerStyles.length === 0) {
      throw new NotFoundException('No beer styles found in the database.');
    }

    const bestStyle = this.findBestBeerStyle(beerStyles, temperature);
    if (!bestStyle) {
      throw new NotFoundException(
        `No suitable beer style found for temperature ${temperature}°C.`,
      );
    }

    this.logger.log(
      `Best style found: ${bestStyle.name}. Searching for playlist...`,
    );

    const playlist = await this.spotifyService.searchPlaylist(bestStyle.name);

    return {
      beerStyle: bestStyle.name,
      playlist,
    };
  }

  private findBestBeerStyle(
    styles: BeerStyleEntity[],
    temp: number,
  ): BeerStyleEntity | null {
    let bestFitStyles: BeerStyleEntity[] = [];
    let minDifference = Infinity;

    styles.forEach((style) => {
      if (style.minTemperature === null || style.maxTemperature === null) {
        return;
      }

      const averageTemp = (style.minTemperature + style.maxTemperature) / 2;
      const difference = Math.abs(temp - averageTemp);

      if (difference < minDifference) {
        minDifference = difference;
        bestFitStyles = [style];
      } else if (difference === minDifference) {
        bestFitStyles.push(style);
      }
    });

    if (bestFitStyles.length === 0) {
      return null;
    }

    if (bestFitStyles.length > 1) {
      bestFitStyles.sort((a, b) => a.name.localeCompare(b.name));
    }

    return bestFitStyles[0];
  }
}
