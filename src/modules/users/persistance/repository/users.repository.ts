import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserRequestDto } from '../../dtos/create-user.dto';
import { UniqueConstraintError } from '../../../../common/models/exceptions';

@Injectable()
export class UsersRepository {
  constructor(private em: EntityManager) {}

  async createUser(createUserDto: CreateUserRequestDto): Promise<User> {
    try {
      const user = new User(createUserDto);
      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new UniqueConstraintError('Email already taken');
      }
      throw new Error(error);
    }
  }

  async getUserById(userId: string): Promise<User> {
    return await this.em.findOneOrFail(User, { id: userId });
  }
}
