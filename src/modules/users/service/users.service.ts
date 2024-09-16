import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserRequestDto, CreateUserResponseDto } from '../dtos/create-user.dto';
import { UsersRepository } from '../persistance/repository/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserRequestDto) {
    try {
      const user = await this.usersRepository.createUser(createUserDto);
      return new CreateUserResponseDto(user);
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.usersRepository.getUserById(userId);
      return new CreateUserResponseDto(user);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
