import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule as ApiGatewayAppModule } from '../src/app.module';
import { of, throwError } from 'rxjs';
import { BreweryEntity, CreateBreweryDto, UpdateBreweryDto } from 'libs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';

class MockBeerCatalogClientProxy {
  private initialBreweries: BreweryEntity[] = [];
  public breweries: BreweryEntity[] = [];
  private nextId = 1;

  constructor() {
    this.initialBreweries.push({
      id: this.nextId++,
      name: 'Cervejaria Coruja',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.reset();
  }

  reset() {
    this.breweries = JSON.parse(JSON.stringify(this.initialBreweries));
    this.nextId = this.breweries.length + 1;
  }

  send(pattern: { cmd: string }, payload: any) {
    switch (pattern.cmd) {
      case 'create_brewery':
        const newBrewery: BreweryEntity = {
          id: this.nextId++,
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.breweries.push(newBrewery);
        return of({ data: newBrewery });

      case 'find_all_breweries':
        return of({
          data: this.breweries,
          meta: {
            total: this.breweries.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });

      case 'find_one_brewery':
        const brewery = this.breweries.find((b) => b.id === payload);
        if (brewery) return of({ data: brewery });
        return throwError(
          () => new NotFoundException(`Brewery with ID #${payload} not found`),
        );

      case 'update_brewery':
        const breweryToUpdate = this.breweries.find((b) => b.id === payload.id);
        if (breweryToUpdate) {
          Object.assign(breweryToUpdate, payload.updateDto);
          return of({ data: breweryToUpdate });
        }
        return throwError(
          () =>
            new NotFoundException(`Brewery with ID #${payload.id} not found`),
        );

      case 'remove_brewery':
        const breweryIndex = this.breweries.findIndex((b) => b.id === payload);
        if (breweryIndex > -1) {
          this.breweries.splice(breweryIndex, 1);
          return of({ data: undefined });
        }
        return throwError(
          () => new NotFoundException(`Brewery with ID #${payload} not found`),
        );

      default:
        return of(null);
    }
  }
}

describe('BreweriesController (e2e)', () => {
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

  describe('POST /breweries', () => {
    it('should create a new brewery and return 201 Created', () => {
      const createDto: CreateBreweryDto = {
        name: faker.company.name(),
      };
      return request(app.getHttpServer())
        .post('/breweries')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe(createDto.name);
        });
    });
  });

  describe('GET /breweries', () => {
    it('should return a paginated list of breweries', () => {
      return request(app.getHttpServer())
        .get('/breweries')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].name).toBe('Cervejaria Coruja');
        });
    });
  });

  describe('GET /breweries/:id', () => {
    it('should return a single brewery by ID', () => {
      return request(app.getHttpServer())
        .get('/breweries/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(1);
        });
    });

    it('should return 404 Not Found for a non-existent ID', () => {
      return request(app.getHttpServer()).get('/breweries/999').expect(404);
    });
  });

  describe('PATCH /breweries/:id', () => {
    it('should update an existing brewery', () => {
      const updateDto: UpdateBreweryDto = {
        name: faker.company.name(),
      };
      return request(app.getHttpServer())
        .patch('/breweries/1')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(1);
          expect(res.body.data.name).toBe(updateDto.name);
        });
    });
  });

  describe('DELETE /breweries/:id', () => {
    it('should create a brewery, then delete it, and confirm deletion', async () => {
      const createDto: CreateBreweryDto = {
        name: 'Cervejaria Fantasma',
      };
      const creationResponse = await request(app.getHttpServer())
        .post('/breweries')
        .send(createDto)
        .expect(201);

      const createdId = creationResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/breweries/${createdId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/breweries/${createdId}`)
        .expect(404);
    });
  });
});
