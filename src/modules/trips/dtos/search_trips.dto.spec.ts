import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchTripsRequestDto, SortBy } from './search_trips.dto';
import { PlaceCode, TripType } from '../../../common/dtos/trip.enum';

describe('Search trips DTO', () => {
  describe('search trip request', () => {
    it('should only accept origin from the enum list', async () => {
      let request = plainToInstance(SearchTripsRequestDto, {});
      let errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(SearchTripsRequestDto, {
        origin: 'a string',
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(SearchTripsRequestDto, {
        origin: PlaceCode.BCN,
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(SearchTripsRequestDto, {
        origin: 'BCN',
        destination: 'AMS',
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);

      request = plainToInstance(SearchTripsRequestDto, {
        origin: 'BCN',
        destination: 'AMS',
        sort_by: 'a string',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(SearchTripsRequestDto, {
        origin: 'BCN',
        destination: 'AMS',
        trip_type: 'a string',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(SearchTripsRequestDto, {
        origin: 'BCN',
        destination: 'AMS',
        sort_by: SortBy.CHEAPEST,
        trip_type: TripType.FLIGHT,
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);
    });

    it('should work also with wrong case', async () => {
      const request = plainToInstance(SearchTripsRequestDto, {
        origin: 'bCn',
        destination: 'amS',
        sort_by: 'CHeAPEsT',
        trip_type: 'FlIGhT',
      });
      const errors = await validate(request);
      expect(errors.length).toBe(0);
    });
  });
});
