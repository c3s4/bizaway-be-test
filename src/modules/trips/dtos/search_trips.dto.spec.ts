import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PlaceCode, SearchTripsRequestDto, SortBy } from './search_trips.dto';

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
        sort_by: SortBy.CHEAPEST,
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);
    });
  });
});
