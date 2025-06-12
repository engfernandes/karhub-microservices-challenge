import { Module } from '@nestjs/common';
import { BeerCatalogController } from './beer-catalog.controller';
import { BeerCatalogService } from './beer-catalog.service';
import { PrismaModule } from 'libs/core';

@Module({
  imports: [PrismaModule],
  controllers: [BeerCatalogController],
  providers: [BeerCatalogService],
})
export class BeerCatalogModule {}
