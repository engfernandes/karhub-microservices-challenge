import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException, // ✅ MUDANÇA 1: Importar NotFoundException
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule as ApiGatewayAppModule } from '../src/app.module';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import {
  BeerStyleEntity,
  CreateBeerStyleDto,
  UpdateBeerStyleDto,
} from 'libs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';

// Mock com a simulação de erro corrigida
class MockBeerCatalogClientProxy {
  private styles: BeerStyleEntity[] = [];
  private nextId = 1;

  constructor() {
    const predictableStyle: BeerStyleEntity = {
      id: this.nextId++,
      name: 'IPA Previsível',
      description: faker.lorem.sentence(),
      minTemperature: 5.0,
      maxTemperature: 10.0,
      averageTemperature: 7.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.styles.push(predictableStyle);
  }

  send(pattern: { cmd: string }, payload: any) {
    switch (pattern.cmd) {
      case 'create_beer_style':
        const newStyle: BeerStyleEntity = {
          id: this.nextId++,
          name: payload.name,
          description: payload.description,
          minTemperature: payload.minTemperature,
          maxTemperature: payload.maxTemperature,
          averageTemperature:
            (payload.minTemperature + payload.maxTemperature) / 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.styles.push(newStyle);
        return of({ data: newStyle });

      case 'find_all_beer_styles':
        return of({
          data: this.styles,
          meta: {
            total: this.styles.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });

      case 'find_one_beer_style':
        const style = this.styles.find((s) => s.id === payload);
        if (style) {
          return of({ data: style });
        }
        // ✅ MUDANÇA 2: Lançar NotFoundException diretamente
        return throwError(
          () =>
            new NotFoundException(`BeerStyle with ID #${payload} not found`),
        );

      case 'update_beer_style':
        const styleToUpdate = this.styles.find((s) => s.id === payload.id);
        if (styleToUpdate) {
          Object.assign(styleToUpdate, payload.updateDto);
          return of({ data: styleToUpdate });
        }
        // ✅ MUDANÇA 2: Lançar NotFoundException diretamente
        return throwError(
          () =>
            new NotFoundException(`BeerStyle with ID #${payload.id} not found`),
        );

      case 'remove_beer_style':
        const styleIndex = this.styles.findIndex((s) => s.id === payload);
        if (styleIndex > -1) {
          this.styles.splice(styleIndex, 1);
          return of({ data: undefined });
        }
        // ✅ MUDANÇA 2: Lançar NotFoundException diretamente
        return throwError(
          () =>
            new NotFoundException(`BeerStyle with ID #${payload} not found`),
        );

      default:
        return of(null);
    }
  }
}

describe('BeerStylesController (e2e)', () => {
  let app: INestApplication;
  let mockClient: MockBeerCatalogClientProxy;

  beforeEach(async () => {
    mockClient = new MockBeerCatalogClientProxy();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayAppModule],
    })
      .overrideProvider('BEER_CATALOG_SERVICE')
      .useValue(mockClient)
      .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // O corpo dos testes (os blocos 'describe' e 'it') permanecem
  // exatamente os mesmos da versão anterior, pois a lógica de
  // asserção e a estrutura esperada já estavam corretas.

  describe('POST /beer-styles', () => {
    it('should create a new beer style and return 201 Created', () => {
      const createDto: CreateBeerStyleDto = {
        name: faker.commerce.productName() + ' Ale',
        description: faker.lorem.sentence(),
        minTemperature: 1,
        maxTemperature: 5,
      };
      return request(app.getHttpServer())
        .post('/beer-styles')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe(createDto.name);
        });
    });
  });

  describe('GET /beer-styles/:id', () => {
    it('should return a single predictable beer style by ID', () => {
      return request(app.getHttpServer())
        .get(`/beer-styles/1`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(1);
          expect(res.body.data.name).toBe('IPA Previsível');
        });
    });
  });

  describe('PATCH /beer-styles/:id', () => {
    it('should update an existing beer style with fake data', () => {
      const updateDto: UpdateBeerStyleDto = {
        description: faker.lorem.words(10),
      };
      return request(app.getHttpServer())
        .patch(`/beer-styles/1`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(1);
          expect(res.body.data.description).toBe(updateDto.description);
        });
    });
  });

  describe('DELETE /beer-styles/:id', () => {
    it('should create a beer style with fake data, then delete it', async () => {
      const createDto: CreateBeerStyleDto = {
        name: faker.company.name() + ' Porter',
        description: faker.lorem.sentence(),
        minTemperature: 1,
        maxTemperature: 5,
      };
      const creationResponse = await request(app.getHttpServer())
        .post('/beer-styles')
        .send(createDto)
        .expect(201);

      const createdId = creationResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/beer-styles/${createdId}`)
        .expect(204);

      // ✅ Este teste agora DEVE passar.
      await request(app.getHttpServer())
        .get(`/beer-styles/${createdId}`)
        .expect(404);
    });
  });
});
