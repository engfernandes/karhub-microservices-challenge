import { Test, TestingModule } from '@nestjs/testing';
import { BeerCatalogController } from './beer-catalog.controller';
import { BeerCatalogService } from './beer-catalog.service';

describe('BeerCatalogController', () => {
  let beerCatalogController: BeerCatalogController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BeerCatalogController],
      providers: [BeerCatalogService],
    }).compile();

    beerCatalogController = app.get<BeerCatalogController>(BeerCatalogController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(beerCatalogController.getHello()).toBe('Hello World!');
    });
  });
});
