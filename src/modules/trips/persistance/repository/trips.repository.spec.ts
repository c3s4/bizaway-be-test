import { MikroORM } from '@mikro-orm/mongodb';
import { TripsRepository } from './trips.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig } from '../../../../common/configs/mikro_orm.config';
import { envConfig, validateEnv } from '../../../../common/configs/environment';
import { PlaceCode } from '../../../../common/dtos/trip.enum';

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
          useFactory: (configService: ConfigService) => dbConfig(configService, true),
        }),
      ],
      providers: [TripsRepository],
    }).compile();

    orm = app.get<MikroORM>(MikroORM);
    tripsRepository = app.get<TripsRepository>(TripsRepository);
  });

  describe('createTrip', () => {
    it('should create a trip', async () => {
      const trip = await tripsRepository.createTrip({
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: Type
        remoteId: '1',
        displayName: 'Trip 1',
      });
      expect(trip).toBeDefined();
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    app.close();
  });
});
