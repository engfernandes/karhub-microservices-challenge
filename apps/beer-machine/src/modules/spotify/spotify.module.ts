import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SpotifyService],
  exports: [SpotifyService],
})
export class SpotifyModule {}
