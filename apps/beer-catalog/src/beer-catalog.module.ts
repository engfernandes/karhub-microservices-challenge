import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/core';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { BeerStylesModule, BeersModule, BreweriesModule } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          ttl: 10,
        }),
      }),
    }),
    PrismaModule,
    BeerStylesModule,
    BeersModule,
    BreweriesModule,
  ],
  controllers: [],
  providers: [],
})
export class BeerCatalogModule {}
