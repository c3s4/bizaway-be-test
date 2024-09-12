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
    it('should return an empty array response', async () => {
      await request(app.getHttpServer()).get('/api/trips/search').expect(400);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
