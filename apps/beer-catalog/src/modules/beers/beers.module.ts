import { Module } from '@nestjs/common';
import { BeersService } from './beers.service';
import { BeersController } from './beers.controller';

@Module({
  providers: [BeersService],
  controllers: [BeersController],
})
export class BeersModule {}
