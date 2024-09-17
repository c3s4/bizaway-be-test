import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginRequestDTO } from './login.dto';

describe('Login DTO', () => {
  describe('login request', () => {
    it('should pass class validation', async () => {
      let request = plainToInstance(LoginRequestDTO, {});
      let errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(LoginRequestDTO, {
        email: 'wrong email',
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(LoginRequestDTO, {
        email: 'email@test.com',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(LoginRequestDTO, {
        password: 'short',
      });
      errors = await validate(request);
      expect(errors.length).toBe(2);

      request = plainToInstance(LoginRequestDTO, {
        password: 'long password',
      });
      errors = await validate(request);
      expect(errors.length).toBe(1);

      request = plainToInstance(LoginRequestDTO, {
        email: 'email@test.com',
        password: 'long password',
      });
      errors = await validate(request);
      expect(errors.length).toBe(0);
    });
  });
});
