import { Module } from '@nestjs/common';
import { UsersRepository } from './persistance/repository/users.repository';

@Module({
  controllers: [],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
