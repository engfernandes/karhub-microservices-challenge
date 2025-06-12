import { Module } from '@nestjs/common';
import { BeerMachineController } from './beer-machine.controller';
import { BeerMachineService } from './beer-machine.service';
import { SpotifyModule, SpotifyService } from './modules';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'BEER_CATALOG_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'beer_catalog_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          ttl: 10,
        }),
      }),
    }),
    SpotifyModule,
  ],
  controllers: [BeerMachineController],
  providers: [BeerMachineService, SpotifyService],
})
export class BeerMachineModule {}
