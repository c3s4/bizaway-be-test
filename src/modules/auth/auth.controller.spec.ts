import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterResponseDTO } from './dtos/register.dto';

const mockedUser = {
  id: 'fake-id',
  email: 'email@test.com',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(true),
            register: jest.fn().mockResolvedValue(new RegisterResponseDTO(mockedUser)),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should allow a user to login', async () => {
      const loginRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      const response = await controller.login(loginRequestDTO);

      expect(response).toEqual(true);
      expect(authService.login).toHaveBeenCalledWith(loginRequestDTO);
    });
    it('should return a 401 login service throw UnauthorizedException', async () => {
      authService.login = jest.fn().mockRejectedValue(new UnauthorizedException('User not found'));
      const loginRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      const pendingPromise = controller.login(loginRequestDTO);

      expect(pendingPromise).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a user', async () => {
      const registerRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      const newUser = await controller.register(registerRequestDTO);

      expect(newUser).toEqual(mockedUser);
      expect(newUser instanceof RegisterResponseDTO).toBeTruthy();
      expect(authService.register).toHaveBeenCalledWith(registerRequestDTO);
    });
    it('should throw an error if the email is already taken', async () => {
      authService.register = jest.fn().mockRejectedValue(new ConflictException('Email already taken'));
      const registerRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      const pendingPromise = controller.register(registerRequestDTO);

      expect(pendingPromise).rejects.toThrow(ConflictException);
    });

    it('should fail for generic error', async () => {
      authService.register = jest.fn().mockRejectedValue(new InternalServerErrorException('Email already taken'));
      const registerRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      const pendingPromise = controller.register(registerRequestDTO);

      expect(pendingPromise).rejects.toThrow(InternalServerErrorException);
    });
  });
});
