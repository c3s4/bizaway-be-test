import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../common/configs/environment';
import { SearchTripIntegrationResponseDto, SortBy } from '../dtos/search_trips.dto';
import { PlaceCode, TripType } from '../../../common/dtos/trip.enum';
import { TripsRepository } from '../persistance/repository/trips.repository';
import { Trip } from '../persistance/entites/trip.entity';
import { SaveTripResponseDto } from '../dtos/save_trip.dto';
import { PAGINATION } from '../../../common/configs/constants';
import { GetTripsListResponseDto } from '../dtos/get_trips.dto';
import { NotFoundException } from '@nestjs/common';

const mockTripsList: SearchTripIntegrationResponseDto[] = [
  {
    origin: PlaceCode.AMS,
    destination: PlaceCode.FRA,
    cost: 3140,
    duration: 42,
    type: 'train',
    id: 'a387d04a-5619-444a-b4bc-9a817a2d5370',
    display_name: 'from AMS to FRA by train',
  },
  {
    origin: PlaceCode.AMS,
    destination: PlaceCode.FRA,
    cost: 5418,
    duration: 40,
    type: 'car',
    id: '52aaf4fb-2f17-4e0b-b4c9-de195b1bb425',
    display_name: 'from AMS to FRA by car',
  },
  {
    origin: PlaceCode.AMS,
    destination: PlaceCode.FRA,
    cost: 2700,
    duration: 6,
    type: 'train',
    id: '3e943e66-ee1a-45c2-84e7-49da4c1e3d7f',
    display_name: 'from AMS to FRA by train',
  },
  {
    origin: PlaceCode.AMS,
    destination: PlaceCode.FRA,
    cost: 7399,
    duration: 47,
    type: 'flight',
    id: '8e3204f8-7ffc-43b0-ab33-1e57badd9399',
    display_name: 'from AMS to FRA by flight',
  },
];

const mockSavedTrips: Trip[] = [
  new Trip({
    origin: PlaceCode.JFK,
    destination: PlaceCode.LAX,
    cost: 100,
    duration: 10,
    type: TripType.FLIGHT,
    remoteId: '1',
    displayName: 'Trip 1',
  }),
  new Trip({
    origin: PlaceCode.CAN,
    destination: PlaceCode.ARN,
    cost: 8700,
    duration: 230,
    type: TripType.TRAIN,
    remoteId: '123',
    displayName: 'Trip 2',
  }),
  new Trip({
    origin: PlaceCode.BCN,
    destination: PlaceCode.LAX,
    cost: 200,
    duration: 20,
    type: TripType.TRAIN,
    remoteId: '3',
    displayName: 'Trip 3',
  }),
  new Trip({
    origin: PlaceCode.AMS,
    destination: PlaceCode.BKK,
    cost: 1000,
    duration: 100,
    type: TripType.CAR,
    remoteId: '2',
    displayName: 'Trip 4',
  }),
];

mockSavedTrips[0].id = 'fake id 1';
mockSavedTrips[1].id = 'fake id 2';
mockSavedTrips[2].id = 'fake id 3';
mockSavedTrips[3].id = 'fake id 4';

// mockSavedTrip.id = 'fake id';

describe('TripsService', () => {
  let tripsService: TripsService;
  let httpService: HttpService;
  let configService: ConfigService;
  let tripsRepository: TripsRepository;

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
        {
          provide: TripsRepository,
          useFactory: () => ({
            createTrip: jest.fn().mockResolvedValue(mockSavedTrips[0]),
            getTrips: jest.fn().mockResolvedValue({ trips: mockSavedTrips, totalTrips: mockSavedTrips.length }),
            deleteTripById: jest.fn().mockResolvedValue(undefined),
          }),
        },
      ],
    }).compile();

    tripsService = module.get<TripsService>(TripsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    tripsRepository = module.get<TripsRepository>(TripsRepository);
  });

  it('should be defined', () => {
    expect(tripsService).toBeDefined();
  });

  describe('searchTripsFromIntegration', () => {
    it('should call external API as expected', async () => {
      await tripsService.searchTripsFromIntegration({ origin: PlaceCode.AMS, destination: PlaceCode.FRA });
      expect(configService.get('plannerApi.url')).toBeDefined();
      expect(configService.get('plannerApi.key')).toBeDefined();
      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get('plannerApi.url')}?origin=${PlaceCode.AMS}&destination=${PlaceCode.FRA}`,
        {
          headers: {
            'x-api-key': configService.get('plannerApi.key'),
          },
        },
      );

      await tripsService.searchTripsFromIntegration({ origin: PlaceCode.BCN, destination: PlaceCode.EWR });
      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get('plannerApi.url')}?origin=${PlaceCode.BCN}&destination=${PlaceCode.EWR}`,
        {
          headers: {
            'x-api-key': configService.get('plannerApi.key'),
          },
        },
      );
    });

    it('should return unsorted list of trips', async () => {
      const tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
      });
      mockTripsList.forEach((trip, index) => {
        expect(tripsLits.items[index]).toEqual({
          origin: trip.origin,
          destination: trip.destination,
          cost: trip.cost,
          duration: trip.duration,
          type: trip.type,
          remoteId: trip.id,
          displayName: trip.display_name,
        });
      });
    });

    it('should return list of trips sorted by cheapest', async () => {
      const tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        sortBy: SortBy.CHEAPEST,
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
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        sortBy: SortBy.FASTEST,
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
      let tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        page: 1,
        itemsPerPage: 2,
      });
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
        displayName: mockTripsList[0].display_name,
      });

      tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        page: 2,
        itemsPerPage: 2,
      });

      expect(tripsLits.currentPage).toEqual(2);
      expect(tripsLits.items[0]).toEqual({
        origin: mockTripsList[2].origin,
        destination: mockTripsList[2].destination,
        cost: mockTripsList[2].cost,
        duration: mockTripsList[2].duration,
        type: mockTripsList[2].type,
        remoteId: mockTripsList[2].id,
        displayName: mockTripsList[2].display_name,
      });

      tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        page: 2,
        itemsPerPage: 1,
      });

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
        displayName: mockTripsList[1].display_name,
      });
    });

    it('should return sorted paginated results', async () => {
      let tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        sortBy: SortBy.CHEAPEST,
        page: 2,
        itemsPerPage: 2,
      });

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
        displayName: mockTripsList[1].display_name,
      });

      tripsLits = await tripsService.searchTripsFromIntegration({
        origin: PlaceCode.AMS,
        destination: PlaceCode.FRA,
        sortBy: SortBy.CHEAPEST,
        page: 20,
        itemsPerPage: 2,
      });

      expect(tripsLits.items).toHaveLength(0);
      expect(tripsLits.currentPage).toEqual(20);
      expect(tripsLits.totalPages).toEqual(2);
      expect(tripsLits.totalItems).toEqual(mockTripsList.length);
      expect(tripsLits.itemsPerPage).toEqual(2);
    });
  });

  describe('saveTrip', () => {
    it('should save a trip', async () => {
      const newTrip = {
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: TripType.FLIGHT,
        remoteId: '1',
        displayName: 'Trip 1',
      };
      const savedTrip = await tripsService.saveTrip(newTrip);
      expect(savedTrip).toEqual({
        id: mockSavedTrips[0].id,
        origin: mockSavedTrips[0].origin,
        destination: mockSavedTrips[0].destination,
        cost: mockSavedTrips[0].cost,
        duration: mockSavedTrips[0].duration,
        type: mockSavedTrips[0].type,
        remoteId: mockSavedTrips[0].remoteId,
        displayName: mockSavedTrips[0].displayName,
      });

      expect(savedTrip instanceof SaveTripResponseDto).toBeTruthy();
      expect(tripsRepository.createTrip).toHaveBeenCalledWith(newTrip);
    });
  });

  describe('getTrips', () => {
    it('should get trips', async () => {
      const trips = await tripsService.getTrips();
      expect(trips.items).toHaveLength(mockSavedTrips.length);
      mockSavedTrips.forEach((trip, index) => {
        expect(trips.items[index]).toEqual({
          id: trip.id,
          origin: trip.origin,
          destination: trip.destination,
          cost: trip.cost,
          duration: trip.duration,
          type: trip.type,
          remoteId: trip.remoteId,
          displayName: trip.displayName,
        });
      });

      expect(trips.currentPage).toEqual(PAGINATION.DEFAULT_PAGE);
      expect(trips.totalPages).toEqual(1);
      expect(trips.totalItems).toEqual(mockSavedTrips.length);
      expect(trips.itemsPerPage).toEqual(PAGINATION.DEFAULT_ITEMS_PER_PAGE);

      expect(tripsRepository.getTrips).toHaveBeenCalledWith(PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_ITEMS_PER_PAGE);
      expect(trips instanceof GetTripsListResponseDto).toBeTruthy();
    });

    it('should get paginated trips', async () => {
      tripsRepository.getTrips = jest
        .fn()
        .mockResolvedValue({ trips: mockSavedTrips.slice(2), totalTrips: mockSavedTrips.length });
      const trips = await tripsService.getTrips({ page: 2, itemsPerPage: 2 });

      expect(tripsRepository.getTrips).toHaveBeenCalledWith(2, 2);
      expect(trips.items).toHaveLength(2);
      expect(trips.currentPage).toEqual(2);
      expect(trips.totalPages).toEqual(2);
      expect(trips.totalItems).toEqual(mockSavedTrips.length);
      expect(trips.itemsPerPage).toEqual(2);

      expect(trips.items[0]).toEqual({
        id: mockSavedTrips[2].id,
        origin: mockSavedTrips[2].origin,
        destination: mockSavedTrips[2].destination,
        cost: mockSavedTrips[2].cost,
        duration: mockSavedTrips[2].duration,
        type: mockSavedTrips[2].type,
        remoteId: mockSavedTrips[2].remoteId,
        displayName: mockSavedTrips[2].displayName,
      });
    });

    it('should return empty list if no trips are found', async () => {
      tripsRepository.getTrips = jest.fn().mockResolvedValue({ trips: [], totalTrips: 0 });
      const trips = await tripsService.getTrips();

      expect(trips.items).toHaveLength(0);
      expect(trips.totalItems).toEqual(0);
      expect(trips.currentPage).toEqual(PAGINATION.DEFAULT_PAGE);
      expect(trips.totalPages).toEqual(0);
      expect(trips.itemsPerPage).toEqual(PAGINATION.DEFAULT_ITEMS_PER_PAGE);
    });
  });

  describe('deleteTripById', () => {
    it('should call repository as expected', async () => {
      const promise = tripsService.deleteTripById('fake id');
      expect(promise).resolves.toBeUndefined();
      expect(tripsRepository.deleteTripById).toHaveBeenCalledWith('fake id');
    });

    it('should throw not found exception', async () => {
      tripsRepository.deleteTripById = jest.fn().mockRejectedValue(new NotFoundException());
      const promise = tripsService.deleteTripById('fake id');
      expect(promise).rejects.toThrow(NotFoundException);
      expect(tripsRepository.deleteTripById).toHaveBeenCalledWith('fake id');
    });
  });
});
