import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule as ApiGatewayAppModule } from '../src/app.module';
import { of } from 'rxjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

class MockClientProxy {
  send(pattern: any, data: { temperature: any }) {
    const temp = Number(data.temperature);

    if (temp >= 20) {
      return {
        data: {
          beerStyle: `${faker.commerce.productAdjective()} ${faker.word.verb()} IPA`,
          playlist: {
            name: faker.music.songName(),
            owner: faker.person.firstName(),
            url: faker.internet.url(),
            imageUrl: faker.image.url(),
            tracks: {
              href: faker.internet.url(),
              total: faker.number.int({ min: 20, max: 150 }),
            },
          },
        },
      };
    }

    if (temp >= 10 && temp < 20) {
      return {
        data: {
          beerStyle: `${faker.commerce.productAdjective()} Pilsen`,
          playlist: null,
        },
      };
    }

    return of(null);
  }
}

describe('BeerMachineController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayAppModule],
    })
      .overrideProvider('BEER_MACHINE_SERVICE')
      .useClass(MockClientProxy)
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

  describe('GET /beer-pairings', () => {
    it('should return 200 OK with a beer and a dynamic playlist when both are found', () => {
      const temperature = 3;
      return request(app.getHttpServer())
        .get('/beer-pairings')
        .query({ temperature })
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.data.beerStyle).toBe('string');
          expect(res.body.data.playlist).toBeDefined();
          expect(typeof res.body.data.playlist.name).toBe('string');
        });
    });

    it('should return 200 OK with a null playlist if only a beer is found', () => {
      const temperature = 5;
      return request(app.getHttpServer())
        .get('/beer-pairings')
        .query({ temperature })
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.data.beerStyle).toBe('string');
          expect(res.body.data.playlist).toBeNull();
        });
    });

    it('should return 400 Bad Request if temperature is not a number', () => {
      return request(app.getHttpServer())
        .get('/beer-pairings')
        .query({ temperature: 'not-a-number' })
        .expect(400);
    });
  });
});
