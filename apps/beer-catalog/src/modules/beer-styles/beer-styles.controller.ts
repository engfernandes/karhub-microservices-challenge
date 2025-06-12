import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
    return this.beerStylesService.create(createDto);
  }

  @MessagePattern({ cmd: 'find_all_beer_styles' })
  findAll(@Payload() query: QueryBeerStyleDto) {
    return this.beerStylesService.findAll(query);
  }

  @MessagePattern({ cmd: 'find_one_beer_style' })
  findOne(@Payload() id: number) {
    return this.beerStylesService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_beer_style' })
  update(@Payload() payload: { id: number; updateDto: UpdateBeerStyleDto }) {
    return this.beerStylesService.update(payload.id, payload.updateDto);
  }

  @MessagePattern({ cmd: 'remove_beer_style' })
  remove(@Payload() id: number) {
    return this.beerStylesService.remove(id);
  }
}
