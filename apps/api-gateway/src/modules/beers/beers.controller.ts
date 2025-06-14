import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BeerEntity,
  CreateBeerDto,
  QueryBeerDto,
  ResponseEntity,
  UpdateBeerDto,
} from 'libs/common';
import { lastValueFrom } from 'rxjs';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Beers')
@Controller('beers')
export class BeersController {
  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new beer' })
  @ApiCreatedResponse({
    description: 'The beer has been successfully created.',
    type: ResponseEntity,
  })
  @ApiConflictResponse({
    description: 'A beer with this name already exists.',
  })
  async create(
    @Body() createBeerDto: CreateBeerDto,
  ): Promise<ResponseEntity<BeerEntity>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'create_beer' },
      createBeerDto,
    );

    return await lastValueFrom(response$);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all beers with pagination and filters' })
  @ApiOkResponse({
    description: 'A paginated list of beers.',
    type: ResponseEntity,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findAll(
    @Query() query: QueryBeerDto,
  ): Promise<ResponseEntity<BeerEntity[]>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_all_beers' },
      query,
    );

    return await lastValueFrom(response$);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a beer by its ID' })
  @ApiOkResponse({
    description: 'The requested beer.',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Beer with the given ID not found.',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseEntity<BeerEntity>> {
    const response$ = this.beerCatalogClient.send({ cmd: 'find_one_beer' }, id);

    return await lastValueFrom(response$);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing beer' })
  @ApiOkResponse({
    description: 'The beer has been successfully updated.',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Beer with the given ID not found.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBeerDto: UpdateBeerDto,
  ): Promise<ResponseEntity<BeerEntity>> {
    const payload = { id, updateDto: updateBeerDto };
    const response$ = this.beerCatalogClient.send(
      { cmd: 'update_beer' },
      payload,
    );

    return await lastValueFrom(response$);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a beer' })
  @ApiNoContentResponse({
    description: 'The beer has been successfully removed.',
  })
  @ApiNotFoundResponse({
    description: 'Beer with the given ID not found.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const response$ = this.beerCatalogClient.send({ cmd: 'remove_beer' }, id);
    await lastValueFrom(response$);
  }
}
