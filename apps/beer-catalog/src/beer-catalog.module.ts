import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/core';
import { BeerStylesModule } from './modules';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

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
  ],
  controllers: [],
  providers: [],
})
export class BeerCatalogModule {}
