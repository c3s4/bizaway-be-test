import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../src/common/configs/environment';
import { configureApp } from '../../../src/init';
import { TripsModule } from '../../../src/modules/trips/trips.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { dbConfig } from '../../../src/common/configs/mikro_orm.config';
import { MikroORM } from '@mikro-orm/mongodb';

describe('[Feature] Trips - /trips', () => {
  let app: INestApplication;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [envConfig],
          envFilePath: '.env.test.local',
          expandVariables: true,
          validate: validateEnv,
          isGlobal: true,
        }),
        MikroOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              envFilePath: '.env',
              expandVariables: true,
            }),
          ],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => dbConfig(configService),
        }),
        TripsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    orm = app.get<MikroORM>(MikroORM);
    configureApp(app);

    await app.init();
    await orm.schema.refreshDatabase();
  });

  describe('GET /search', () => {
    it('should fail because of not valid data', async () => {
      await request(app.getHttpServer()).get('/api/trips/search').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=wrong').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=&destination=').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=wrong&destination=wrong').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=&destination=wrong').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=BCN&destination=wrong').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=BCN&destination=').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=wrong&destination=BCN').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=&destination=BCN').expect(400);
      await request(app.getHttpServer()).get('/api/trips/search?origin=BCN&destination=IST&sort_by=wrong').expect(400);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&page=0')
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&page=-1')
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&items_per_page=0')
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&items_per_page=-1')
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&page=')
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&items_per_page=')
        .expect(400);
    });

    it('should complete successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST')
        .expect(200);
      expect(response.body).toHaveProperty('current_page');
      expect(response.body).toHaveProperty('total_pages');
      expect(response.body).toHaveProperty('total_items');
      expect(response.body).toHaveProperty('items_per_page');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBeTruthy();

      if (response.body.items.length > 0) {
        expect(response.body.items[0]).toHaveProperty('origin');
        expect(response.body.items[0]).toHaveProperty('destination');
        expect(response.body.items[0]).toHaveProperty('cost');
        expect(response.body.items[0]).toHaveProperty('duration');
        expect(response.body.items[0]).toHaveProperty('type');
        expect(response.body.items[0]).toHaveProperty('remote_id');
        expect(response.body.items[0]).toHaveProperty('display_name');
      }

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=fastest')
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=fastest&page=1&items_per_page=10')
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=IST&destination=IST&sort_by=fastest&page=1&items_per_page=10')
        .expect(200);
    });
  });

  describe('POST /', () => {
    it('should fail because of not valid data', async () => {
      const newTripInvalidRequest = {
        origin: 'wrong',
        destination: 'wrong',
        cost: -1,
        duration: -1,
        type: 'wrong',
        remote_id: 'wrong',
        display_name: '',
      };

      let response = await request(app.getHttpServer()).post('/api/trips/');
      expect(response.status).toBe(400);
      expect(response.body.message.length).toBe(7);
      response = await request(app.getHttpServer()).post('/api/trips/').send(newTripInvalidRequest);
      expect(response.status).toBe(400);
      expect(response.body.message.length).toBe(7);
    });

    it('should save a trip as expected', async () => {
      const newTripRequest = {
        origin: 'BCN',
        destination: 'IST',
        cost: 100,
        duration: 10,
        type: 'flight',
        remote_id: '123e4567-e89b-12d3-a456-426614174300',
        display_name: 'test',
      };

      const response = await request(app.getHttpServer()).post('/api/trips/').send(newTripRequest);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id.length).toBeGreaterThan(0);
      expect(newTripRequest).toEqual({
        origin: response.body.origin,
        destination: response.body.destination,
        cost: response.body.cost,
        duration: response.body.duration,
        type: response.body.type,
        remote_id: response.body.remote_id,
        display_name: response.body.display_name,
      });
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    await app.close();
  });
});
