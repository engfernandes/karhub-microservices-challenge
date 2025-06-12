import { Module } from '@nestjs/common';
import { BeerMachineController } from './beer-machine.controller';
import { BeerMachineService } from './beer-machine.service';

@Module({
  imports: [],
  controllers: [BeerMachineController],
  providers: [BeerMachineService],
})
export class BeerMachineModule {}
