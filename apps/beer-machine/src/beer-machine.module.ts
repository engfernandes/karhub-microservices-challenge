import { Module } from '@nestjs/common';
import { BeerMachineController } from './beer-machine.controller';
import { BeerMachineService } from './beer-machine.service';
import { SpotifyModule } from './modules';
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
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'beer_catalog_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url:
            configService.getOrThrow<string>('REDIS_URL') ||
            'redis://localhost:6379',
          ttl: 10,
        }),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    SpotifyModule,
  ],
  controllers: [BeerMachineController],
  providers: [BeerMachineService],
})
export class BeerMachineModule {}
