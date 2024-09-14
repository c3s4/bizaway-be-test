import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './service/trips.service';
import { SearchTripResponseDto, SearchTripsRequestDto, SortBy } from './dtos/search_trips.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlaceCode, TripType } from '../../common/dtos/trip.enum';
import { SaveTripResponseDto } from './dtos/save_trip.dto';

const trips: SearchTripResponseDto[] = [
  {
    origin: PlaceCode.BCN,
    destination: PlaceCode.LAX,
    cost: 159,
    duration: 39,
    type: 'train',
    remoteId: 'a5b0e087-ad0a-41e7-94c4-00634a222823',
    displayName: 'from BCN to LAX by train',
  },
  {
    origin: PlaceCode.BCN,
    destination: PlaceCode.LAX,
    cost: 282,
    duration: 38,
    type: 'car',
    remoteId: 'ca89c6d5-445c-4f7f-aa4b-d4860bcf1d31',
    displayName: 'from BCN to LAX by car',
  },
];

const mockSavedTrips: SaveTripResponseDto[] = [
  new SaveTripResponseDto({
    id: 'fake id 1',
    origin: PlaceCode.JFK,
    destination: PlaceCode.LAX,
    cost: 100,
    duration: 10,
    type: TripType.FLIGHT,
    remoteId: '1',
    displayName: 'Trip 1',
  }),
  new SaveTripResponseDto({
    id: 'fake id',
    origin: PlaceCode.JNB,
    destination: PlaceCode.DEL,
    cost: 200,
    duration: 20,
    type: TripType.FLIGHT,
    remoteId: '2',
    displayName: 'Trip 2',
  }),
  new SaveTripResponseDto({
    id: 'fake id 3',
    origin: PlaceCode.BCN,
    destination: PlaceCode.LAX,
    cost: 300,
    duration: 30,
    type: TripType.CAR,
    remoteId: '3',
    displayName: 'Trip 3',
  }),
  new SaveTripResponseDto({
    id: 'fake id 4',
    origin: PlaceCode.DXB,
    destination: PlaceCode.CPH,
    cost: 400,
    duration: 40,
    type: TripType.TRAIN,
    remoteId: '4',
    displayName: 'Trip 4',
  }),
];

const mockedTripsList = {
  items: mockSavedTrips,
  totalItems: mockSavedTrips.length,
  currentPage: 1,
  totalPages: 2,
  itemsPerPage: 2,
};

const mockTripsService = (): Partial<TripsService> => ({
  searchTripsFromIntegration: jest.fn().mockResolvedValue({
    items: trips,
    totalItems: 3,
    currentPage: 1,
    totalPages: 2,
    itemsPerPage: 2,
  }),
  saveTrip: jest.fn().mockResolvedValue(mockSavedTrips[0]),
  getTrips: jest.fn().mockResolvedValue(mockedTripsList),
  deleteTripById: jest.fn().mockResolvedValue(undefined),
  getTripById: jest.fn().mockResolvedValue(mockSavedTrips[0]),
});
describe('TripsController', () => {
  let controller: TripsController;
  let tripService: TripsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useFactory: mockTripsService,
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    tripService = module.get<TripsService>(TripsService);
  });

  describe('searchTrips', () => {
    it('should return a list of trips', async () => {
      let searchParams: SearchTripsRequestDto = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
      };
      const foundTrips = await controller.searchTrips(searchParams);
      expect(foundTrips).toEqual({
        items: trips,
        totalItems: 3,
        currentPage: 1,
        totalPages: 2,
        itemsPerPage: 2,
      });

      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);

      searchParams = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        sortBy: SortBy.CHEAPEST,
      };

      await controller.searchTrips(searchParams);
      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);

      searchParams = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        page: 2,
      };
      await controller.searchTrips(searchParams);
      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);

      searchParams = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        page: 2,
        itemsPerPage: 1,
      };
      await controller.searchTrips(searchParams);
      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);

      searchParams = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        page: 2,
        itemsPerPage: 1,
        sortBy: SortBy.FASTEST,
      };
      await controller.searchTrips(searchParams);
      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);

      searchParams = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        page: 2,
        itemsPerPage: 1,
        sortBy: SortBy.FASTEST,
        tripType: TripType.CAR,
      };
      await controller.searchTrips(searchParams);
      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);
    });

    it('should throw an error if the page number is too high', async () => {
      const searchParams: SearchTripsRequestDto = {
        origin: PlaceCode.BCN,
        destination: PlaceCode.LAX,
        page: 3,
      };
      const foundTrips = controller.searchTrips(searchParams);
      expect(tripService.searchTripsFromIntegration).toHaveBeenCalledWith(searchParams);
      await expect(foundTrips).rejects.toThrow(BadRequestException);
    });
  });

  describe('saveTrip', () => {
    it('should save a trip', async () => {
      const saveTripRequest = {
        origin: PlaceCode.JFK,
        destination: PlaceCode.LAX,
        cost: 100,
        duration: 10,
        type: TripType.FLIGHT,
        remoteId: '1',
        displayName: 'Trip 1',
      };

      const savedTrip = await controller.saveTrip(saveTripRequest);
      expect(tripService.saveTrip).toHaveBeenCalledWith(saveTripRequest);
      expect(savedTrip).toEqual(mockSavedTrips[0]);
    });
  });

  describe('getTrips', () => {
    it('should return a list of trips', async () => {
      const tripsResponse = await controller.getTrips();
      expect(tripsResponse).toEqual(mockedTripsList);
      expect(tripService.getTrips).toHaveBeenCalledWith(undefined);

      await controller.getTrips({ page: 2 });
      expect(tripService.getTrips).toHaveBeenCalledWith({ page: 2 });

      await controller.getTrips({ page: 2, itemsPerPage: 14 });
      expect(tripService.getTrips).toHaveBeenCalledWith({ page: 2, itemsPerPage: 14 });
    });
    it('should return an empty list if no trips are found', async () => {
      tripService.getTrips = jest.fn().mockResolvedValue({
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        itemsPerPage: 10,
      });

      const tripsResponse = await controller.getTrips();
      expect(tripsResponse).toEqual({
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        itemsPerPage: 10,
      });
    });
  });

  describe('deleteTripById', () => {
    it('should call service as expected', () => {
      const responsePromise = controller.deleteTripById('any id');
      expect(responsePromise).resolves.toBeUndefined();
      expect(tripService.deleteTripById).toHaveBeenCalledWith('any id');
    });
    it('should throw not found exception', () => {
      tripService.deleteTripById = jest.fn().mockRejectedValue(new NotFoundException());

      const responsePromise = controller.deleteTripById('any id');
      expect(responsePromise).rejects.toThrow(NotFoundException);
      expect(tripService.deleteTripById).toHaveBeenCalledWith('any id');
    });
  });

  describe('getTripById', () => {
    it('should return a trip', async () => {
      const trip = await controller.getTripById('fake id 1');
      expect(trip).toEqual(mockSavedTrips[0]);
      expect(tripService.getTripById).toHaveBeenCalledWith('fake id 1');
    });
    it('should throw a not found exception', async () => {
      tripService.getTripById = jest.fn().mockRejectedValue(new NotFoundException());
      const responsePromise = controller.getTripById('any id');
      expect(responsePromise).rejects.toThrow(NotFoundException);
      expect(tripService.getTripById).toHaveBeenCalledWith('any id');
    });
  });
});
