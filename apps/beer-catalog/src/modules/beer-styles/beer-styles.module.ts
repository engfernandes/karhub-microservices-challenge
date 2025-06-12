import { BeerStylesService } from './beer-styles.service';
import { BeerStylesController } from './beer-styles.controller';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv(process.env.REDIS_URL),
          ],
        };
      },
    }),
  ],
  controllers: [BeerStylesController],
  providers: [BeerStylesService],
})
export class BeerStylesModule {}
