import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../common/configs/environment';

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
          validate: validateEnv,
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

  it('should call external API as expected', async () => {
    await tripsService.searchTripsFromIntegration({ origin: 'AMS', destination: 'FRA' });
    expect(configService.get('plannerApi.url')).toBeDefined();
    expect(configService.get('plannerApi.key')).toBeDefined();
    expect(httpService.get).toHaveBeenCalledWith(`${configService.get('plannerApi.url')}?origin=AMS&destination=FRA`, {
      headers: {
        'x-api-key': configService.get('plannerApi.key'),
      },
    });

    await tripsService.searchTripsFromIntegration({ origin: 'BCN', destination: 'EWR' });
    expect(httpService.get).toHaveBeenCalledWith(`${configService.get('plannerApi.url')}?origin=BCN&destination=EWR`, {
      headers: {
        'x-api-key': configService.get('plannerApi.key'),
      },
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

  it('should return list of trips sorted by cheapest', async () => {
    const tripsLits = await tripsService.searchTripsFromIntegration({
      origin: 'AMS',
      destination: 'FRA',
      sort_by: 'cheapest',
    });
    expect(tripsLits.items).toHaveLength(mockTripsList.length);
    expect(tripsLits.items[0].remoteId).toEqual('3e943e66-ee1a-45c2-84e7-49da4c1e3d7f');
    expect(tripsLits.items[0].cost).toEqual(2700);
    expect(tripsLits.items[1].remoteId).toEqual('a387d04a-5619-444a-b4bc-9a817a2d5370');
    expect(tripsLits.items[1].cost).toEqual(3140);
    expect(tripsLits.items[2].remoteId).toEqual('52aaf4fb-2f17-4e0b-b4c9-de195b1bb425');
    expect(tripsLits.items[2].cost).toEqual(5418);
    expect(tripsLits.items[3].remoteId).toEqual('8e3204f8-7ffc-43b0-ab33-1e57badd9399');
    expect(tripsLits.items[3].cost).toEqual(7399);
  });

  it('should return list of trips sorted by fastest', async () => {
    const tripsLits = await tripsService.searchTripsFromIntegration({
      origin: 'AMS',
      destination: 'FRA',
      sort_by: 'fastest',
    });
    expect(tripsLits.items).toHaveLength(mockTripsList.length);
    expect(tripsLits.items[0].remoteId).toEqual('3e943e66-ee1a-45c2-84e7-49da4c1e3d7f');
    expect(tripsLits.items[0].duration).toEqual(6);
    expect(tripsLits.items[1].remoteId).toEqual('52aaf4fb-2f17-4e0b-b4c9-de195b1bb425');
    expect(tripsLits.items[1].duration).toEqual(40);
    expect(tripsLits.items[2].remoteId).toEqual('a387d04a-5619-444a-b4bc-9a817a2d5370');
    expect(tripsLits.items[2].duration).toEqual(42);
    expect(tripsLits.items[3].remoteId).toEqual('8e3204f8-7ffc-43b0-ab33-1e57badd9399');
    expect(tripsLits.items[3].duration).toEqual(47);
  });

  it('should return paginated results', async () => {
    let tripsLits = await tripsService.searchTripsFromIntegration(
      {
        origin: 'AMS',
        destination: 'FRA',
      },
      {
        page: 1,
        itemsPerPage: 2,
      },
    );
    expect(tripsLits.items).toHaveLength(2);
    expect(tripsLits.currentPage).toEqual(1);
    expect(tripsLits.totalPages).toEqual(2);
    expect(tripsLits.totalItems).toEqual(mockTripsList.length);
    expect(tripsLits.itemsPerPage).toEqual(2);

    expect(tripsLits.items[0]).toEqual({
      origin: mockTripsList[0].origin,
      destination: mockTripsList[0].destination,
      cost: mockTripsList[0].cost,
      duration: mockTripsList[0].duration,
      type: mockTripsList[0].type,
      remoteId: mockTripsList[0].id,
      display_name: mockTripsList[0].display_name,
    });

    tripsLits = await tripsService.searchTripsFromIntegration(
      {
        origin: 'AMS',
        destination: 'FRA',
      },
      {
        page: 2,
        itemsPerPage: 2,
      },
    );

    expect(tripsLits.currentPage).toEqual(2);
    expect(tripsLits.items[0]).toEqual({
      origin: mockTripsList[2].origin,
      destination: mockTripsList[2].destination,
      cost: mockTripsList[2].cost,
      duration: mockTripsList[2].duration,
      type: mockTripsList[2].type,
      remoteId: mockTripsList[2].id,
      display_name: mockTripsList[2].display_name,
    });

    tripsLits = await tripsService.searchTripsFromIntegration(
      {
        origin: 'AMS',
        destination: 'FRA',
      },
      {
        page: 2,
        itemsPerPage: 1,
      },
    );

    expect(tripsLits.items).toHaveLength(1);
    expect(tripsLits.currentPage).toEqual(2);
    expect(tripsLits.totalPages).toEqual(4);
    expect(tripsLits.totalItems).toEqual(mockTripsList.length);
    expect(tripsLits.itemsPerPage).toEqual(1);
    expect(tripsLits.items[0]).toEqual({
      origin: mockTripsList[1].origin,
      destination: mockTripsList[1].destination,
      cost: mockTripsList[1].cost,
      duration: mockTripsList[1].duration,
      type: mockTripsList[1].type,
      remoteId: mockTripsList[1].id,
      display_name: mockTripsList[1].display_name,
    });
  });

  it('should return sorted paginated results', async () => {
    const tripsLits = await tripsService.searchTripsFromIntegration(
      {
        origin: 'AMS',
        destination: 'FRA',
        sort_by: 'cheapest',
      },
      {
        page: 2,
        itemsPerPage: 2,
      },
    );

    expect(tripsLits.items).toHaveLength(2);
    expect(tripsLits.currentPage).toEqual(2);
    expect(tripsLits.totalPages).toEqual(2);
    expect(tripsLits.totalItems).toEqual(mockTripsList.length);
    expect(tripsLits.itemsPerPage).toEqual(2);
    expect(tripsLits.items[0]).toEqual({
      origin: mockTripsList[1].origin,
      destination: mockTripsList[1].destination,
      cost: mockTripsList[1].cost,
      duration: mockTripsList[1].duration,
      type: mockTripsList[1].type,
      remoteId: mockTripsList[1].id,
      display_name: mockTripsList[1].display_name,
    });
  });
});
