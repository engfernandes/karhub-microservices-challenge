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
} from '@nestjs/common';
import { BeerStylesService } from './beer-styles.service';
import {
  CreateBeerStyleDto,
  QueryBeerStyleDto,
  UpdateBeerStyleDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ResponseEntity } from 'libs/common';
import { BeerStyleEntity } from './entities';

@ApiTags('Beer Styles')
@Controller('beer-styles')
export class BeerStylesController {
  constructor(private readonly beerStylesService: BeerStylesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new beer style' })
  @ApiCreatedResponse({
    description: 'The beer style has been successfully created.',
    type: ResponseEntity,
  })
  @ApiConflictResponse({
    description: 'A beer style with this name already exists.',
  })
  create(
    @Body() createBeerStyleDto: CreateBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    return this.beerStylesService.create(createBeerStyleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all beer styles with pagination and filters',
  })
  @ApiOkResponse({
    description: 'A paginated list of beer styles.',
    type: ResponseEntity,
  })
  findAll(
    @Query() query: QueryBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity[]>> {
    return this.beerStylesService.findAll(query);
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
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    return this.beerStylesService.findOne(id);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBeerStyleDto: UpdateBeerStyleDto,
  ): Promise<ResponseEntity<BeerStyleEntity>> {
    return this.beerStylesService.update(id, updateBeerStyleDto);
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
  remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseEntity<void>> {
    return this.beerStylesService.remove(id);
  }
}
