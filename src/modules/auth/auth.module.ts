import { Module } from '@nestjs/common';
import { BcryptService } from './service/bcrypt.service';
import { AuthService } from './service/auth.service';
import { HashingService } from './service/hashing.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get('jwt.accessTokenTtl'),
            issuer: configService.get('jwt.issuer'),
            audience: configService.get('jwt.audience'),
          },
        };
      },
    }),
  ],
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
