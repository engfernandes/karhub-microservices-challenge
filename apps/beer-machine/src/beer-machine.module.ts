import { Module } from '@nestjs/common';
import { BeerMachineController } from './beer-machine.controller';
import { BeerMachineService } from './beer-machine.service';
import { SpotifyModule } from './modules';

@Module({
  imports: [SpotifyModule],
  controllers: [BeerMachineController],
  providers: [BeerMachineService],
})
export class BeerMachineModule {}
