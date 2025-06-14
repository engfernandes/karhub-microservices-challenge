import { Controller, HttpException } from '@nestjs/common';
import { BeersService } from './beers.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateBeerDto, QueryBeerDto, UpdateBeerDto } from 'libs/common';

@Controller()
export class BeersController {
  constructor(private readonly beersService: BeersService) {}

  @MessagePattern({ cmd: 'create_beer' })
  async create(@Payload() createDto: CreateBeerDto) {
    try {
      return await this.beersService.create(createDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'find_all_beers' })
  async findAll(@Payload() query: QueryBeerDto) {
    return await this.beersService.findAll(query);
  }

  @MessagePattern({ cmd: 'find_one_beer' })
  async findOne(@Payload() id: number) {
    try {
      return await this.beersService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'update_beer' })
  async update(@Payload() payload: { id: number; updateDto: UpdateBeerDto }) {
    try {
      return await this.beersService.update(payload.id, payload.updateDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'remove_beer' })
  async remove(@Payload() id: number) {
    try {
      return await this.beersService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }
}
