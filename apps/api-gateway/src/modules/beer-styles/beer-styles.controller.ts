import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import {
  CreateBeerStyleDto,
  QueryBeerStyleDto,
  UpdateBeerStyleDto,
  ResponseEntity,
  BeerStyleEntity,
} from 'libs/common';
import { lastValueFrom } from 'rxjs';

/**
 * Controller responsible for handling beer style-related HTTP requests.
 * Communicates with the beer-catalog microservice to perform CRUD operations on beer styles.
 */
@ApiTags('Beer Styles')
@Controller('beer-styles')
export class BeerStylesController {
  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
  ) {}

  /**
   * Creates a new beer style.
   * @param createBeerStyleDto The data to create the new beer style.
   * @returns The created beer style entity wrapped in a response entity.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new beer style' })
  @ApiCreatedResponse({
    description: 'The beer style has been successfully created.',
    type: ResponseEntity,
  })
  @ApiConflictResponse({
    description: 'A beer style with this name already exists.',
  })
  async create(
    @Body() createBeerStyleDto: CreateBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'create_beer_style' },
      createBeerStyleDto,
    );
    return await lastValueFrom(response$);
  }

  /**
   * Retrieves all beer styles with optional pagination and filters.
   * @param query Query parameters for filtering and pagination.
   * @returns A paginated list of beer style entities wrapped in a response entity.
   */
  @Get()
  @ApiOperation({
    summary: 'Retrieve all beer styles with pagination and filters',
  })
  @ApiOkResponse({
    description: 'A paginated list of beer styles.',
    type: ResponseEntity,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findAll(
    @Query() query: QueryBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity[]>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_all_beer_styles' },
      query,
    );
    return await lastValueFrom(response$);
  }

  /**
   * Retrieves a beer style by its ID.
   * @param id The ID of the beer style to retrieve.
   * @returns The requested beer style entity wrapped in a response entity.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single beer style by its ID' })
  @ApiOkResponse({
    description: 'The requested beer style.',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Beer style with the given ID not found.',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_one_beer_style' },
      id,
    );
    return await lastValueFrom(response$);
  }

  /**
   * Updates an existing beer style by its ID.
   * @param id The ID of the beer style to update.
   * @param updateBeerStyleDto The data to update the beer style.
   * @returns The updated beer style entity wrapped in a response entity.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing beer style' })
  @ApiOkResponse({
    description: 'The beer style has been successfully updated.',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Beer style with the given ID not found.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBeerStyleDto: UpdateBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    const payload = { id, updateDto: updateBeerStyleDto };
    const response$ = this.beerCatalogClient.send(
      { cmd: 'update_beer_style' },
      payload,
    );
    return await lastValueFrom(response$);
  }

  /**
   * Removes a beer style by its ID.
   * @param id The ID of the beer style to remove.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a beer style' })
  @ApiNoContentResponse({
    description: 'The beer style has been successfully removed.',
  })
  @ApiNotFoundResponse({
    description: 'Beer style with the given ID not found.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'remove_beer_style' },
      id,
    );
    await lastValueFrom(response$);
  }
}
