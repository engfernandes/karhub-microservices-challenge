import { Controller, Get } from '@nestjs/common';
import { BeerMachineService } from './beer-machine.service';

@Controller()
export class BeerMachineController {
  constructor(private readonly beerMachineService: BeerMachineService) {}

  @Get()
  getHello(): string {
    return this.beerMachineService.getHello();
  }
}
