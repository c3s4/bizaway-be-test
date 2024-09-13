import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../src/common/configs/environment';
import { configureApp } from '../../../src/init';

describe('[Feature] Trips - /trips', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          load: [envConfig],
          envFilePath: '.env.test.local',
          expandVariables: true,
          validate: validateEnv,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
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

  afterEach(async () => {
    await app.close();
  });
});
