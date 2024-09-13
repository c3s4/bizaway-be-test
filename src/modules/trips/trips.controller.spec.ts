import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './service/trips.service';
import { SearchTripResponseDto, SearchTripsRequestDto, SortBy } from './dtos/search_trips.dto';
import { BadRequestException } from '@nestjs/common';
import { PlaceCode } from '../../common/dtos/trip.enum';

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

const mockTripsService = () => ({
  searchTripsFromIntegration: jest.fn().mockResolvedValue({
    items: trips,
    totalItems: 3,
    currentPage: 1,
    totalPages: 2,
    itemsPerPage: 2,
  }),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

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
