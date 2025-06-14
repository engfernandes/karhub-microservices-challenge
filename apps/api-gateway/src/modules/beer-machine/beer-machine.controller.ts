import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { GetBeerPairingDto } from 'libs/common';

@ApiTags('Beer Machine Recommendations')
@Controller('beer-pairings')
export class BeerMachineController {
  constructor(
    @Inject('BEER_MACHINE_SERVICE') private beerMachineClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get a beer and playlist recommendation based on temperature',
  })
  @ApiResponse({ status: 200, description: 'Recommendation found.' })
  @ApiResponse({
    status: 404,
    description: 'No suitable recommendation',
  })
  @ApiResponse({ status: 400, description: 'Invalid temperature provided.' })
  async getBeerPairing(
    @Query(new ValidationPipe({ transform: true }))
    query: GetBeerPairingDto,
  ) {
    const response = await lastValueFrom(
      this.beerMachineClient.send(
        { cmd: 'get_beer_pairing' },
        { temperature: query.temperature },
      ),
    );

    if (!response) {
      throw new NotFoundException(
        'A suitable playlist could not be found for the recommended beer.',
      );
    }

    return response;
  }
}
