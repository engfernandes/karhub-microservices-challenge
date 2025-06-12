import { BeerStylesService } from './beer-styles.service';
import { BeerStylesController } from './beer-styles.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [BeerStylesController],
  providers: [BeerStylesService],
})
export class BeerStylesModule {}
