import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PagedRequestDto } from './paged_results.dto';

describe('Paged request DTO', () => {
  describe('page request', () => {
    it('should only accept valid data', async () => {
      let request = plainToInstance(PagedRequestDto, {});
      let errors = await validate(request);
      expect(errors.length).toBe(0);

      request = plainToInstance(PagedRequestDto, {
        page: 'a string',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(PagedRequestDto, {
        itemsPerPage: 'a string',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(PagedRequestDto, {
        page: 'a string',
        itemsPerPage: 'a string',
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(PagedRequestDto, {
        page: 0,
        itemsPerPage: -20,
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(PagedRequestDto, {
        page: 1,
        itemsPerPage: 10,
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);
    });
  });
});
