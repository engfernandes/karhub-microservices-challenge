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

/**
 * Controller responsible for handling beer-related HTTP requests.
 * Communicates with the beer-catalog microservice to perform CRUD operations on beers.
 */
@ApiTags('Beers')
@Controller('beers')
export class BeersController {
  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
  ) {}

  /**
   * Creates a new beer.
   * @param createBeerDto The data to create the new beer.
   * @returns The created beer entity wrapped in a response entity.
   */
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

  /**
   * Retrieves all beers with optional pagination and filters.
   * @param query Query parameters for filtering and pagination.
   * @returns A paginated list of beer entities wrapped in a response entity.
   */
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

  /**
   * Retrieves a beer by its ID.
   * @param id The ID of the beer to retrieve.
   * @returns The requested beer entity wrapped in a response entity.
   */
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

  /**
   * Updates an existing beer by its ID.
   * @param id The ID of the beer to update.
   * @param updateBeerDto The data to update the beer.
   * @returns The updated beer entity wrapped in a response entity.
   */
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

  /**
   * Removes a beer by its ID.
   * @param id The ID of the beer to remove.
   */
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
