import { Test, TestingModule } from '@nestjs/testing';
import { BeerMachineController } from './beer-machine.controller';
import { BeerMachineService } from './beer-machine.service';

describe('BeerMachineController', () => {
  let beerMachineController: BeerMachineController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BeerMachineController],
      providers: [BeerMachineService],
    }).compile();

    beerMachineController = app.get<BeerMachineController>(BeerMachineController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(beerMachineController.getHello()).toBe('Hello World!');
    });
  });
});
