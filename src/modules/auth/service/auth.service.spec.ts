import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';
import { RegisterRequestDTO, RegisterResponseDTO } from '../dtos/register.dto';
import { UsersRepository } from '../../users/persistance/repository/users.repository';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UniqueConstraintError } from '../../../common/models/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../common/configs/environment';
import { LoginRequestDTO } from '../dtos/login.dto';

const mockedUser = {
  id: 'fake-id',
  email: 'email@test.com',
  password: 'fake-password',
};

describe('AuthService', () => {
  let service: AuthService;
  let hashingService: HashingService;
  let usersRepository: UsersRepository;

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
        AuthService,
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockedUser),
            getUserByEmail: jest.fn().mockResolvedValue(mockedUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    hashingService = module.get<HashingService>(HashingService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('register', () => {
    it('should register a user', async () => {
      const registerRequest: RegisterRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      const savedUser = await service.register(registerRequest);

      expect(savedUser).toEqual({
        id: mockedUser.id,
        email: mockedUser.email,
      });
      expect(savedUser).not.toHaveProperty('password');

      expect(usersRepository.createUser).toHaveBeenCalledWith({
        email: registerRequest.email,
        password: 'hashed-password',
      });
      expect(hashingService.hash).toHaveBeenCalledWith(registerRequest.password);

      expect(savedUser instanceof RegisterResponseDTO).toBeTruthy();
    });

    it('should throw an error if the email is already taken', async () => {
      usersRepository.createUser = jest.fn().mockRejectedValue(new UniqueConstraintError('Email already taken'));
      const registerRequest: RegisterRequestDTO = { email: 'email@test.com', password: 'fake-password' };
      let pendingPromise = service.register(registerRequest);

      expect(pendingPromise).rejects.toThrow(ConflictException);

      usersRepository.createUser = jest.fn().mockRejectedValue(new Error('Generic error'));
      pendingPromise = service.register(registerRequest);

      expect(pendingPromise).rejects.toThrow(InternalServerErrorException);
    });
  });
  describe('login', () => {
    it('should login a user', async () => {
      const loginRequest: LoginRequestDTO = { email: 'email@test.com', password: 'login-password' };
      const loggedUser = await service.login(loginRequest);

      expect(loggedUser).toEqual({ accessToken: 'fake-token' });
    });

    it('should throw UnauthorizedException because user not found', async () => {
      usersRepository.getUserByEmail = jest.fn().mockRejectedValue(new Error('User not found'));
      const pendingResponse = service.login({ email: 'email@test.com', password: 'login-password' });

      expect(pendingResponse).rejects.toThrow(UnauthorizedException);
    });
    it('should throw UnauthorizedException because password is incorrect', async () => {
      hashingService.compare = jest.fn().mockResolvedValue(false);
      const pendingResponse = service.login({ email: 'email@test.com', password: 'login-password' });

      expect(pendingResponse).rejects.toThrow(UnauthorizedException);
    });
  });
});
