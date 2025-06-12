import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/core';
import { BeerStylesModule } from './modules';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BeerStylesModule,
  ],
  controllers: [],
  providers: [],
})
export class BeerCatalogModule {}
