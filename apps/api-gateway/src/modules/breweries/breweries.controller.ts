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
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  BreweryEntity,
  CreateBreweryDto,
  QueryBreweryDto,
  ResponseEntity,
} from 'libs/common';
import { lastValueFrom } from 'rxjs';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Controller responsible for handling brewery-related HTTP requests.
 * Communicates with the beer-catalog microservice to perform CRUD operations on breweries.
 */
@ApiTags('Breweries')
@Controller('breweries')
export class BreweriesController {
  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
  ) {}

  /**
   * Creates a new brewery.
   * @param createBreweryDto The data to create the new brewery.
   * @returns The created brewery entity wrapped in a response entity.
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new brewery',
  })
  @ApiCreatedResponse({
    description: 'The brewery has been successfully created.',
    type: ResponseEntity,
  })
  @ApiConflictResponse({
    description: 'A brewery with this name already exists.',
  })
  async create(
    @Body() createBreweryDto: CreateBreweryDto,
  ): Promise<ResponseEntity<BreweryEntity>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'create_brewery' },
      createBreweryDto,
    );

    return await lastValueFrom(response$);
  }

  /**
   * Retrieves all breweries with optional pagination and filters.
   * @param query Query parameters for filtering and pagination.
   * @returns A paginated list of brewery entities wrapped in a response entity.
   */
  @Get()
  @ApiOperation({
    summary: 'Retrieve all breweries with pagination and filters',
  })
  @ApiOkResponse({
    description: 'A paginated list of breweries',
    type: ResponseEntity,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findAll(
    @Query() query: QueryBreweryDto,
  ): Promise<ResponseEntity<BreweryEntity[]>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_all_breweries' },
      query,
    );

    return await lastValueFrom(response$);
  }

  /**
   * Retrieves a brewery by its ID.
   * @param id The ID of the brewery to retrieve.
   * @returns The requested brewery entity wrapped in a response entity.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a brewery by its ID',
  })
  @ApiOkResponse({
    description: 'The requested brewery',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Brewery with the given ID not found',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseEntity<BreweryEntity>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_one_brewery' },
      id,
    );

    return await lastValueFrom(response$);
  }

  /**
   * Updates an existing brewery by its ID.
   * @param id The ID of the brewery to update.
   * @param updateBreweryDto The data to update the brewery.
   * @returns The updated brewery entity wrapped in a response entity.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing brewery',
  })
  @ApiOkResponse({
    description: 'The brewery has been successfully updated.',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Brewery with the given ID not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBreweryDto: CreateBreweryDto,
  ): Promise<ResponseEntity<BreweryEntity>> {
    const payload = { id, updateDto: updateBreweryDto };
    const response$ = this.beerCatalogClient.send(
      { cmd: 'update_brewery' },
      payload,
    );

    return await lastValueFrom(response$);
  }

  /**
   * Removes a brewery by its ID.
   * @param id The ID of the brewery to remove.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a brewery',
  })
  @ApiNoContentResponse({
    description: 'The requested brewery has been successfully removed.',
  })
  @ApiNotFoundResponse({
    description: 'Brewery with the given ID not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'remove_brewery' },
      id,
    );
    await lastValueFrom(response$);
  }
}
