import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig } from '../../../common/configs/environment';

const mockTripsList = [
  {
    origin: 'AMS',
    destination: 'FRA',
    cost: 3140,
    duration: 42,
    type: 'train',
    id: 'a387d04a-5619-444a-b4bc-9a817a2d5370',
    display_name: 'from AMS to FRA by train',
  },
  {
    origin: 'AMS',
    destination: 'FRA',
    cost: 5418,
    duration: 40,
    type: 'car',
    id: '52aaf4fb-2f17-4e0b-b4c9-de195b1bb425',
    display_name: 'from AMS to FRA by car',
  },
  {
    origin: 'AMS',
    destination: 'FRA',
    cost: 2700,
    duration: 6,
    type: 'train',
    id: '3e943e66-ee1a-45c2-84e7-49da4c1e3d7f',
    display_name: 'from AMS to FRA by train',
  },
  {
    origin: 'AMS',
    destination: 'FRA',
    cost: 7399,
    duration: 47,
    type: 'flight',
    id: '8e3204f8-7ffc-43b0-ab33-1e57badd9399',
    display_name: 'from AMS to FRA by flight',
  },
];
describe('TripsService', () => {
  let tripsService: TripsService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [envConfig],
          envFilePath: '.env.test.local',
          expandVariables: true,
        }),
      ],
      providers: [
        TripsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of({ data: mockTripsList })),
          },
        },
      ],
    }).compile();

    tripsService = module.get<TripsService>(TripsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(tripsService).toBeDefined();
  });

  it('should return unsorted list of trips', async () => {
    const tripsLits = await tripsService.searchTripsFromIntegration({ origin: 'AMS', destination: 'FRA' });
    mockTripsList.forEach((trip, index) => {
      expect(tripsLits.items[index]).toEqual({
        origin: trip.origin,
        destination: trip.destination,
        cost: trip.cost,
        duration: trip.duration,
        type: trip.type,
        remoteId: trip.id,
        display_name: trip.display_name,
      });
    });
  });

  it('should return unsorted list of trips', async () => {
    const tripsLits = await tripsService.searchTripsFromIntegration({ origin: 'AMS', destination: 'FRA' });
    mockTripsList.forEach((trip, index) => {
      expect(tripsLits.items[index]).toEqual({
        origin: trip.origin,
        destination: trip.destination,
        cost: trip.cost,
        duration: trip.duration,
        type: trip.type,
        remoteId: trip.id,
        display_name: trip.display_name,
      });
    });
  });

  it('should call external API', async () => {
    await tripsService.searchTripsFromIntegration({ origin: 'AMS', destination: 'FRA' });
    expect(configService.get('plannerApi.url')).toBeDefined();
    expect(httpService.get).toHaveBeenCalledWith(`${configService.get('plannerApi.url')}?origin=AMS&destination=FRA`);
  });
});
