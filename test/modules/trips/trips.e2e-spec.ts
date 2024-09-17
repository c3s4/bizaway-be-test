import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
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
import { RedisModule } from '../../../src/modules/redis/redis.module';

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
              envFilePath: '.env.test.local',
              expandVariables: true,
            }),
          ],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            ...dbConfig(configService, true),
            entities: ['./dist/**/trip.entity*.js'],
            entitiesTs: ['./src/**/trip.entity*.ts'],
          }),
        }),
        TripsModule,
        RedisModule.registerAsync({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return {
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
            };
          },
        }),
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
      await request(app.getHttpServer()).get('/api/trips/search').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer()).get('/api/trips/search?origin=wrong').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer()).get('/api/trips/search?origin=&destination=').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=wrong&destination=wrong')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=&destination=wrong')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=wrong')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=wrong&destination=BCN')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=&destination=BCN')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=wrong')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&trip_type=')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&trip_type=bus')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&page=0')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&page=-1')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&items_per_page=0')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&items_per_page=-1')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&page=')
        .expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=cheapest&items_per_page=')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should complete successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST')
        .expect(HttpStatus.OK);
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
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&trip_type=flight')
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=bcn&destination=ist&trip_type=flight')
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=BCN&destination=IST&sort_by=fastest&trip_type=train&page=1&items_per_page=10')
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=IST&destination=IST&sort_by=fastest&page=1&items_per_page=10')
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get('/api/trips/search?origin=bcn&destination=ist&sort_by=FAStest&trip_type=trAIN&page=1&items_per_page=10')
        .expect(HttpStatus.OK);
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
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message.length).toBe(7);
      response = await request(app.getHttpServer()).post('/api/trips/').send(newTripInvalidRequest);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
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
      expect(response.status).toBe(HttpStatus.CREATED);
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
      await request(app.getHttpServer()).get('/api/trips?page=0').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer()).get('/api/trips?page=-1').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer()).get('/api/trips?items_per_page=0').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer()).get('/api/trips?items_per_page=-1').expect(HttpStatus.BAD_REQUEST);
      await request(app.getHttpServer()).get('/api/trips?page=&items_per_page=').expect(HttpStatus.BAD_REQUEST);
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
        cost: HttpStatus.OK,
        duration: 20,
        type: TripType.TRAIN,
        remoteId: '3',
        displayName: 'Trip 3',
      });

      await orm.em.persistAndFlush([trip1, trip2, trip3]);

      let response = await request(app.getHttpServer()).get('/api/trips/');
      expect(response.status).toBe(HttpStatus.OK);
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
      expect(response.status).toBe(HttpStatus.OK);
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
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.items.length).toBe(0);
      expect(response.body.current_page).toBe(PAGINATION.DEFAULT_PAGE);
      expect(response.body.total_pages).toBe(0);
      expect(response.body.total_items).toBe(0);
      expect(response.body.items_per_page).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE);
    });
  });

  describe('GET /:id', () => {
    it('should return a trip as expected', async () => {
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
        cost: HttpStatus.OK,
        duration: 20,
        type: TripType.TRAIN,
        remoteId: '3',
        displayName: 'Trip 3',
      });

      await orm.em.persistAndFlush([trip1, trip2, trip3]);

      let response = await request(app.getHttpServer()).get(`/api/trips/${trip1.id}`);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        id: trip1.id,
        origin: trip1.origin,
        destination: trip1.destination,
        cost: trip1.cost,
        duration: trip1.duration,
        type: trip1.type,
        remote_id: trip1.remoteId,
        display_name: trip1.displayName,
      });

      response = await request(app.getHttpServer()).get(`/api/trips/${trip2.id}`);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        id: trip2.id,
        origin: trip2.origin,
        destination: trip2.destination,
        cost: trip2.cost,
        duration: trip2.duration,
        type: trip2.type,
        remote_id: trip2.remoteId,
        display_name: trip2.displayName,
      });
    });

    it('should fail with not found exception', async () => {
      await request(app.getHttpServer()).get(`/api/trips/fake_id`).expect(HttpStatus.NOT_FOUND);

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

      await request(app.getHttpServer()).get(`/api/trips/fake_id`).expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /:id', () => {
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
        cost: HttpStatus.OK,
        duration: 20,
        type: TripType.TRAIN,
        remoteId: '3',
        displayName: 'Trip 3',
      });

      await orm.em.persistAndFlush([trip1, trip2, trip3]);

      let allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(3);

      await request(app.getHttpServer()).delete(`/api/trips/${trip2.id}`).expect(HttpStatus.NO_CONTENT);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(2);

      await request(app.getHttpServer()).delete(`/api/trips/${trip1.id}`).expect(HttpStatus.NO_CONTENT);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(1);

      await request(app.getHttpServer()).delete(`/api/trips/${trip3.id}`).expect(HttpStatus.NO_CONTENT);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips).toHaveLength(0);
    });

    it('should fail with not found exception', async () => {
      await request(app.getHttpServer()).delete(`/api/trips/fake_id`).expect(HttpStatus.NOT_FOUND);

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

      await request(app.getHttpServer()).delete(`/api/trips/fake_id`).expect(HttpStatus.NOT_FOUND);
      await request(app.getHttpServer()).delete(`/api/trips/`).expect(HttpStatus.NOT_FOUND);
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    await app.close();
  });
});
