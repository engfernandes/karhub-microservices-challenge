import { Controller, HttpException } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { BeerStylesService } from './beer-styles.service';
import {
  BeerStyleEntity,
  CreateBeerStyleDto,
  QueryBeerStyleDto,
  ResponseEntity,
  UpdateBeerStyleDto,
} from 'libs/common';

@Controller()
export class BeerStylesController {
  constructor(private readonly beerStylesService: BeerStylesService) {}

  @MessagePattern({ cmd: 'create_beer_style' })
  async create(@Payload() createDto: CreateBeerStyleDto) {
    try {
      return await this.beerStylesService.create(createDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'find_all_beer_styles' })
  async findAll(@Payload() query: QueryBeerStyleDto) {
    return await this.beerStylesService.findAll(query);
  }

  @MessagePattern({ cmd: 'find_one_beer_style' })
  async findOne(@Payload() id: number) {
    try {
      return await this.beerStylesService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'update_beer_style' })
  async update(
    @Payload() payload: { id: number; updateDto: UpdateBeerStyleDto },
  ) {
    try {
      return await this.beerStylesService.update(payload.id, payload.updateDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'remove_beer_style' })
  async remove(@Payload() id: number) {
    try {
      return await this.beerStylesService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'find_best_style_by_temp' })
  async findBestByTemp(
    @Payload('temperature') temperature: number,
  ): Promise<ResponseEntity<BeerStyleEntity[]>> {
    const bestMatches =
      await this.beerStylesService.findBestMatchByTemperature(temperature);
    return new ResponseEntity(bestMatches);
  }
}
