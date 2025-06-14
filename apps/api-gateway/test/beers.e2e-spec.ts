import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule as ApiGatewayAppModule } from '../src/app.module';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { BeerEntity, CreateBeerDto, UpdateBeerDto } from 'libs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';

class MockBeerCatalogClientProxy {
  private initialBeers: BeerEntity[] = [];
  public beers: BeerEntity[] = [];
  private nextId = 1;

  constructor() {
    this.initialBeers.push({
      id: this.nextId++,
      name: 'Super Bock Stout',
      abv: 5.0,
      styleId: 1,
      breweryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.reset();
  }

  reset() {
    this.beers = JSON.parse(JSON.stringify(this.initialBeers));
    this.nextId = this.beers.length + 1;
  }

  send(pattern: { cmd: string }, payload: any) {
    switch (pattern.cmd) {
      case 'create_beer':
        const newBeer: BeerEntity = {
          id: this.nextId++,
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.beers.push(newBeer);
        return of({ data: newBeer });

      case 'find_all_beers':
        return of({
          data: this.beers,
          meta: { total: this.beers.length, page: 1, limit: 10, totalPages: 1 },
        });

      case 'find_one_beer':
        const beer = this.beers.find((b) => b.id === payload);
        if (beer) return of({ data: beer });
        return throwError(
          () => new NotFoundException(`Beer with ID #${payload} not found`),
        );

      case 'update_beer':
        const beerToUpdate = this.beers.find((b) => b.id === payload.id);
        if (beerToUpdate) {
          Object.assign(beerToUpdate, payload.updateDto);
          return of({ data: beerToUpdate });
        }
        return throwError(
          () => new NotFoundException(`Beer with ID #${payload.id} not found`),
        );

      case 'remove_beer':
        const beerIndex = this.beers.findIndex((b) => b.id === payload);
        if (beerIndex > -1) {
          this.beers.splice(beerIndex, 1);
          return of({ data: undefined });
        }
        return throwError(
          () => new NotFoundException(`Beer with ID #${payload} not found`),
        );

      default:
        return of(null);
    }
  }
}

describe('BeersController (e2e)', () => {
  let app: INestApplication;
  let mockBeerCatalog: MockBeerCatalogClientProxy;

  beforeAll(async () => {
    mockBeerCatalog = new MockBeerCatalogClientProxy();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayAppModule],
    })
      .overrideProvider('BEER_CATALOG_SERVICE')
      .useValue(mockBeerCatalog)
      .overrideProvider('BEER_MACHINE_SERVICE')
      .useValue({ send: () => of({}) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockBeerCatalog.reset();
  });

  describe('POST /beers', () => {
    it('should create a new beer and return 201 Created', () => {
      const createDto: CreateBeerDto = {
        name: faker.commerce.productName(),
        abv: faker.number.float({
          min: 4,
          max: 12,
          fractionDigits: 1,
        }),
        styleId: faker.number.int({ min: 1, max: 10 }),
        breweryId: faker.number.int({ min: 1, max: 5 }),
      };
      return request(app.getHttpServer())
        .post('/beers')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe(createDto.name);
          expect(res.body.data.abv).toBe(createDto.abv);
        });
    });
  });

  describe('GET /beers', () => {
    it('should return a paginated list of beers', () => {
      return request(app.getHttpServer())
        .get('/beers')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].name).toBe('Super Bock Stout');
        });
    });
  });

  describe('GET /beers/:id', () => {
    it('should return a single beer by ID', () => {
      return request(app.getHttpServer())
        .get('/beers/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(1);
        });
    });

    it('should return 404 Not Found for a non-existent ID', () => {
      return request(app.getHttpServer()).get('/beers/999').expect(404);
    });
  });

  describe('PATCH /beers/:id', () => {
    it('should update an existing beer', () => {
      const updateDto: UpdateBeerDto = {
        abv: 2,
      };
      return request(app.getHttpServer())
        .patch('/beers/1')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(1);
          expect(res.body.data.abv).toBe(updateDto.abv);
        });
    });
  });

  describe('DELETE /beers/:id', () => {
    it('should create a beer, then delete it, and confirm deletion', async () => {
      const createDto: CreateBeerDto = {
        name: 'Cerveja a ser Deletada',
        abv: 6.5,
        styleId: 2,
        breweryId: 1,
      };
      const creationResponse = await request(app.getHttpServer())
        .post('/beers')
        .send(createDto)
        .expect(201);

      const createdId = creationResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/beers/${createdId}`)
        .expect(204);

      await request(app.getHttpServer()).get(`/beers/${createdId}`).expect(404);
    });
  });
});
