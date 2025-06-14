import { Controller, HttpException } from '@nestjs/common';
import { BreweriesService } from './breweries.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CreateBreweryDto,
  QueryBreweryDto,
  UpdateBreweryDto,
} from 'libs/common';

@Controller()
export class BreweriesController {
  constructor(private readonly breweriesService: BreweriesService) {}

  @MessagePattern({ cmd: 'create_brewery' })
  async create(@Payload() createDto: CreateBreweryDto) {
    try {
      return await this.breweriesService.create(createDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'find_all_breweries' })
  async findAll(@Payload() query: QueryBreweryDto) {
    return await this.breweriesService.findAll(query);
  }

  @MessagePattern({ cmd: 'find_one_brewery' })
  async findOne(@Payload() id: number) {
    try {
      return await this.breweriesService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'update_brewery' })
  async update(
    @Payload() payload: { id: number; updateDto: UpdateBreweryDto },
  ) {
    try {
      return await this.breweriesService.update(payload.id, payload.updateDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'remove_brewery' })
  async remove(@Payload() id: number) {
    try {
      return await this.breweriesService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }
}
