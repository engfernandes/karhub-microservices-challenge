import { Injectable } from '@nestjs/common';

@Injectable()
export class BeerMachineService {
  getHello(): string {
    return 'Hello World!';
  }
}
