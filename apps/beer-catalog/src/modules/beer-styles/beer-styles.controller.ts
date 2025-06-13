import { Controller, HttpException } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { BeerStylesService } from './beer-styles.service';
import {
  CreateBeerStyleDto,
  QueryBeerStyleDto,
  UpdateBeerStyleDto,
} from 'libs/common';

@Controller()
export class BeerStylesController {
  constructor(private readonly beerStylesService: BeerStylesService) {}

  @MessagePattern({ cmd: 'create_beer_style' })
  create(@Payload() createDto: CreateBeerStyleDto) {
    try {
      return this.beerStylesService.create(createDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'find_all_beer_styles' })
  findAll(@Payload() query: QueryBeerStyleDto) {
    return this.beerStylesService.findAll(query);
  }

  @MessagePattern({ cmd: 'find_one_beer_style' })
  findOne(@Payload() id: number) {
    try {
      return this.beerStylesService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'update_beer_style' })
  update(@Payload() payload: { id: number; updateDto: UpdateBeerStyleDto }) {
    try {
      return this.beerStylesService.update(payload.id, payload.updateDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'remove_beer_style' })
  remove(@Payload() id: number) {
    try {
      return this.beerStylesService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }
}
