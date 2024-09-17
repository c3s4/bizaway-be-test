import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterRequestDTO } from './register.dto';

describe('Login DTO', () => {
  describe('login request', () => {
    it('should pass class validation', async () => {
      let request = plainToInstance(RegisterRequestDTO, {});
      let errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(RegisterRequestDTO, {
        email: 'wrong email',
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(RegisterRequestDTO, {
        email: 'email@test.com',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(RegisterRequestDTO, {
        password: 'short',
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(RegisterRequestDTO, {
        password: 'long password',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(RegisterRequestDTO, {
        email: 'email@test.com',
        password: 'long password',
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);
    });
  });
});
