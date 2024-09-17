import { Module } from '@nestjs/common';
import { BcryptService } from './service/bcrypt.service';
import { AuthService } from './service/auth.service';
import { HashingService } from './service/hashing.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    AuthService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
