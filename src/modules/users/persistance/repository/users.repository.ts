import { EntityManager } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserRequestDto } from '../../dtos/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private em: EntityManager) {}

  async createUser(createUserDto: CreateUserRequestDto): Promise<User> {
    const user = new User(createUserDto);
    await this.em.persistAndFlush(user);
    return user;
  }

  async getUserById(userId: string): Promise<User> {
    return await this.em.findOneOrFail(User, { id: userId });
  }
}
