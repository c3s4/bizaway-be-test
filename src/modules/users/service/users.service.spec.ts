import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../persistance/repository/users.repository';
import { CreateUserRequestDto, CreateUserResponseDto } from '../dtos/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { get } from 'http';

const mockedUser = {
  id: 'fake-id',
  email: 'email@test.com',
  password: 'fake-password',
};
describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockedUser),
            getUserById: jest.fn().mockResolvedValue(mockedUser),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserRequestDto = { email: 'email@test.com', password: 'fake-password' };
      const savedUser = await service.createUser(createUserDto);

      expect(savedUser).toEqual({
        id: mockedUser.id,
        email: mockedUser.email,
      });

      expect(usersRepository.createUser).toHaveBeenCalledWith(createUserDto);
      expect(savedUser instanceof CreateUserResponseDto).toBeTruthy();
    });

    it('should throw an error if the email is already taken', async () => {
      usersRepository.createUser = jest.fn().mockRejectedValue(new Error('Email already taken'));
      const createUserDto: CreateUserRequestDto = { email: 'email@test.com', password: 'fake-password' };
      const pendingPromise = service.createUser(createUserDto);

      expect(pendingPromise).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserById', () => {
    it('should get a user by id', async () => {
      const foundUser = await service.getUserById('any id');
      expect(foundUser).toEqual({
        id: mockedUser.id,
        email: mockedUser.email,
      });

      expect(usersRepository.getUserById).toHaveBeenCalledWith('any id');
      expect(foundUser instanceof CreateUserResponseDto).toBeTruthy();
    });

    it('should throw an error if the user is not found', async () => {
      usersRepository.getUserById = jest.fn().mockRejectedValue(new Error('User not found'));
      const pendingPromise = service.getUserById('any id');

      expect(pendingPromise).rejects.toThrow(NotFoundException);
    });
  });
});
