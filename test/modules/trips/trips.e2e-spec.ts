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
import { Trip } from '../../../src/modules/trips/persistance/entites/trip.entity';
import { PlaceCode, TripType } from '../../../src/common/dtos/trip.enum';
import { PAGINATION } from '../../../src/common/configs/constants';

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
          useFactory: (configService: ConfigService) => dbConfig(configService, true),
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

  describe('GET /', () => {
    it('should fail because of not valid data', async () => {
      await request(app.getHttpServer()).get('/api/trips?page=0').expect(400);
      await request(app.getHttpServer()).get('/api/trips?page=-1').expect(400);
      await request(app.getHttpServer()).get('/api/trips?items_per_page=0').expect(400);
      await request(app.getHttpServer()).get('/api/trips?items_per_page=-1').expect(400);
      await request(app.getHttpServer()).get('/api/trips?page=&items_per_page=').expect(400);
    });

    it('should return a list of trips', async () => {
      const trip1 = new Trip({
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: TripType.FLIGHT,
        remoteId: '1',
        displayName: 'Trip 1',
      });

      const trip2 = new Trip({
        origin: PlaceCode.AMS,
        destination: PlaceCode.BKK,
        cost: 1000,
        duration: 100,
        type: TripType.CAR,
        remoteId: '2',
        displayName: 'Trip 2',
      });

      const trip3 = new Trip({
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        cost: 200,
        duration: 20,
        type: TripType.TRAIN,
        remoteId: '3',
        displayName: 'Trip 3',
      });

      await orm.em.persistAndFlush([trip1, trip2, trip3]);

      let response = await request(app.getHttpServer()).get('/api/trips/');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3);
      expect(response.body.items[0]).toEqual({
        id: trip1.id,
        origin: trip1.origin,
        destination: trip1.destination,
        cost: trip1.cost,
        duration: trip1.duration,
        type: trip1.type,
        remote_id: trip1.remoteId,
        display_name: trip1.displayName,
      });
      expect(response.body.current_page).toBe(PAGINATION.DEFAULT_PAGE);
      expect(response.body.total_pages).toBe(1);
      expect(response.body.total_items).toBe(3);
      expect(response.body.items_per_page).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE);

      response = await request(app.getHttpServer()).get('/api/trips?page=2&items_per_page=2');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0]).toEqual({
        id: trip3.id,
        origin: trip3.origin,
        destination: trip3.destination,
        cost: trip3.cost,
        duration: trip3.duration,
        type: trip3.type,
        remote_id: trip3.remoteId,
        display_name: trip3.displayName,
      });
      expect(response.body.current_page).toBe(2);
      expect(response.body.total_pages).toBe(2);
      expect(response.body.total_items).toBe(3);
      expect(response.body.items_per_page).toBe(2);
    });

    it('should return an empty array of trips', async () => {
      const response = await request(app.getHttpServer()).get('/api/trips/');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(0);
      expect(response.body.current_page).toBe(PAGINATION.DEFAULT_PAGE);
      expect(response.body.total_pages).toBe(0);
      expect(response.body.total_items).toBe(0);
      expect(response.body.items_per_page).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE);
    });
  });

  describe.only('DELETE /:id', () => {
    it('should delete trips as expected', async () => {
      const trip1 = new Trip({
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: TripType.FLIGHT,
        remoteId: '1',
        displayName: 'Trip 1',
      });

      const trip2 = new Trip({
        origin: PlaceCode.AMS,
        destination: PlaceCode.BKK,
        cost: 1000,
        duration: 100,
        type: TripType.CAR,
        remoteId: '2',
        displayName: 'Trip 2',
      });

      const trip3 = new Trip({
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        cost: 200,
        duration: 20,
        type: TripType.TRAIN,
        remoteId: '3',
        displayName: 'Trip 3',
      });

      await orm.em.persistAndFlush([trip1, trip2, trip3]);

      let allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(3);

      await request(app.getHttpServer()).delete(`/api/trips/${trip2.id}`).expect(204);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(2);

      await request(app.getHttpServer()).delete(`/api/trips/${trip1.id}`).expect(204);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(1);

      await request(app.getHttpServer()).delete(`/api/trips/${trip3.id}`).expect(204);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(0);
    });

    it('should fail with not found exception', async () => {
      await request(app.getHttpServer()).delete(`/api/trips/fake_id`).expect(404);

      const trip1 = new Trip({
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: TripType.FLIGHT,
        remoteId: '1',
        displayName: 'Trip 1',
      });
      await orm.em.persistAndFlush(trip1);

      await request(app.getHttpServer()).delete(`/api/trips/fake_id`).expect(404);
      await request(app.getHttpServer()).delete(`/api/trips/`).expect(404);
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    await app.close();
  });
});
