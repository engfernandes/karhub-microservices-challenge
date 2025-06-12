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

@ApiTags('Beer Styles')
@Controller('beer-styles')
export class BeerStylesController {
  constructor(
    @Inject('BEER_CATALOG_SERVICE') private beerCatalogClient: ClientProxy,
  ) {}

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

  @Get()
  @ApiOperation({
    summary: 'Retrieve all beer styles with pagination and filters',
  })
  @ApiOkResponse({
    description: 'A paginated list of beer styles.',
    type: ResponseEntity,
  })
  async findAll(
    @Query() query: QueryBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity[]>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_all_beer_styles' },
      query,
    );
    return await lastValueFrom(response$);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single beer style by its ID' })
  @ApiOkResponse({
    description: 'The requested beer style.',
    type: ResponseEntity,
  })
  @ApiNotFoundResponse({
    description: 'Beer style with the given ID not found.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    const response$ = this.beerCatalogClient.send(
      { cmd: 'find_one_beer_style' },
      id,
    );
    return await lastValueFrom(response$);
  }

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
