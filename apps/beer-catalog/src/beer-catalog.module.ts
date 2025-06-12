import { Module } from '@nestjs/common';
import { BeerCatalogController } from './beer-catalog.controller';
import { BeerCatalogService } from './beer-catalog.service';

@Module({
  imports: [],
  controllers: [BeerCatalogController],
  providers: [BeerCatalogService],
})
export class BeerCatalogModule {}
