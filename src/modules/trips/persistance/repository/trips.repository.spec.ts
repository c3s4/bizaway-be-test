import { MikroORM, NotFoundError } from '@mikro-orm/mongodb';
import { TripsRepository } from './trips.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig } from '../../../../common/configs/mikro_orm.config';
import { envConfig, validateEnv } from '../../../../common/configs/environment';
import { PlaceCode, TripType } from '../../../../common/dtos/trip.enum';
import { Trip } from '../entites/trip.entity';

describe('TripsRepository', () => {
  let tripsRepository: TripsRepository;
  let orm: MikroORM;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              load: [envConfig],
              envFilePath: '.env.test.local',
              expandVariables: true,
              validate: validateEnv,
            }),
          ],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            ...dbConfig(configService, true),
            entities: ['./dist/**/trip.entity*.js'],
            entitiesTs: ['./src/**/trip.entity*.ts'],
          }),
        }),
      ],
      providers: [TripsRepository],
    }).compile();

    orm = app.get<MikroORM>(MikroORM);
    tripsRepository = app.get<TripsRepository>(TripsRepository);

    await orm.schema.refreshDatabase();
  });

  describe('createTrip', () => {
    it('should create a trip', async () => {
      const trip = await tripsRepository.createTrip({
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: TripType.FLIGHT,
        remoteId: '1',
        displayName: 'Trip 1',
      });
      expect(trip).toBeDefined();
      expect(trip.id).toBeDefined();

      const allTrips = await orm.em.findAll(Trip);
      expect(allTrips.length).toBe(1);
      expect(allTrips[0]).toEqual(trip);
    });
  });

  describe('getAllTrips', () => {
    it('should return paginated trips', async () => {
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

      let results = await tripsRepository.getTrips(1, 10);
      expect(results.trips.length).toBe(3);
      expect(results.trips).toEqual([trip1, trip2, trip3]);
      expect(results.totalTrips).toBe(3);

      results = await tripsRepository.getTrips(1, 2);
      expect(results.trips.length).toBe(2);
      expect(results.trips).toEqual([trip1, trip2]);
      expect(results.totalTrips).toBe(3);

      results = await tripsRepository.getTrips(2, 2);
      expect(results.trips.length).toBe(1);
      expect(results.trips).toEqual([trip3]);
      expect(results.totalTrips).toBe(3);
    });

    it('should return empty array if no trips are found', async () => {
      const results = await tripsRepository.getTrips(1, 10);
      expect(results.trips.length).toBe(0);
      expect(results.totalTrips).toBe(0);
    });
  });

  describe('deleteTripById', () => {
    it('should throw not found exception', async () => {
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

      const response = tripsRepository.deleteTripById('fake id');
      expect(response).rejects.toThrow(NotFoundError);
    });

    it('should delete exactly one record', async () => {
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
      expect(allTrips.length).toBe(3);

      const response = tripsRepository.deleteTripById(trip2.id);
      expect(response).resolves.toBeUndefined();
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips.length).toBe(2);

      await tripsRepository.deleteTripById(trip1.id);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips.length).toBe(1);
      expect(allTrips[0]).toEqual(trip3);

      await tripsRepository.deleteTripById(trip3.id);
      allTrips = await orm.em.findAll(Trip);
      expect(allTrips.length).toBe(0);
    });
  });

  describe('getTripById', () => {
    it('should throw not found exception', async () => {
      const response = tripsRepository.getTripById('fake id');
      expect(response).rejects.toThrow();

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

      const response2 = tripsRepository.getTripById('fake id');
      expect(response2).rejects.toThrow();
    });

    it('should return a trip', async () => {
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

      const trip = await tripsRepository.getTripById(trip1.id);
      expect(trip).toEqual(trip1);
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    app.close();
  });
});
