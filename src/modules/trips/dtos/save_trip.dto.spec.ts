import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveTripRequestDto } from './save_trip.dto';

describe('Save trip DTO', () => {
  describe('save trip request', () => {
    it('should pass class validation', async () => {
      let request = plainToInstance(SaveTripRequestDto, {});
      let errors = await validate(request);
      expect(errors.length).toBe(7);

      request = plainToInstance(SaveTripRequestDto, {
        origin: 'BCN',
      });
      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        destination: 'FRA',
      });
      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        type: 'flight',
      });
      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        cost: 123,
      });
      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        duration: 1230,
      });
      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        remote_id: 'b098097a-accc-49d6-9e57-ceb684b6b3de',
      });

      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        display_name: 'trip from BCN to FRA by train',
      });
      errors = await validate(request);
      expect(errors.length).toBe(6);

      request = plainToInstance(SaveTripRequestDto, {
        origin: 'BCN',
        destination: 'FRA',
        type: 'flight',
        cost: 123,
        duration: 1230,
        remote_id: 'b098097a-accc-49d6-9e57-ceb684b6b3de',
        display_name: 'trip from BCN to FRA by train',
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);
    });
  });
});
