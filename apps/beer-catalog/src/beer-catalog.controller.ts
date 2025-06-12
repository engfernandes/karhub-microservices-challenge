import { Controller, Get } from '@nestjs/common';
import { BeerCatalogService } from './beer-catalog.service';

@Controller()
export class BeerCatalogController {
  constructor(private readonly beerCatalogService: BeerCatalogService) {}

  @Get()
  getHello(): string {
    return this.beerCatalogService.getHello();
  }
}
