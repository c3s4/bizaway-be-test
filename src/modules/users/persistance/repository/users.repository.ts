import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UniqueConstraintError } from '../../../../common/models/exceptions';

@Injectable()
export class UsersRepository {
  constructor(private em: EntityManager) {}

  async createUser(userData: { email: string; password: string }): Promise<User> {
    try {
      const user = new User(userData);
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

  async getUserByEmail(email: string): Promise<User> {
    return await this.em.findOneOrFail(User, { email });
  }
}
