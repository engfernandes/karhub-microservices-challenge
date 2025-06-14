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

@ApiTags('Breweries')
@Controller('breweries')
export class BreweriesController {
  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
  ) {}

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
