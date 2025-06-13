import { Controller, HttpException } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { BeerMachineService } from './beer-machine.service';

@Controller()
export class BeerMachineController {
  constructor(private readonly beerMachineService: BeerMachineService) {}

  @MessagePattern({ cmd: 'get_beer_pairing' })
  getBeerPairing(@Payload() data: { temperature: number }) {
    try {
      return this.beerMachineService.getBeerPairing(data.temperature);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new RpcException(error.getResponse());
      }
      throw error;
    }
  }
}
