import { Module } from '@nestjs/common';
import { BreweriesService } from './breweries.service';
import { BreweriesController } from './breweries.controller';

@Module({
  providers: [BreweriesService],
  controllers: [BreweriesController]
})
export class BreweriesModule {}
