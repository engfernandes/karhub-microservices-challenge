import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BeerMachineService } from './beer-machine.service';

@Controller()
export class BeerMachineController {
  constructor(private readonly beerMachineService: BeerMachineService) {}

  @MessagePattern({ cmd: 'get_beer_pairing' })
  getBeerPairing(@Payload() data: { temperature: number }) {
    return this.beerMachineService.getBeerPairing(data.temperature);
  }
}
