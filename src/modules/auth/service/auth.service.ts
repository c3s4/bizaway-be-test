import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDTO, LoginResponseDTO } from '../dtos/login.dto';
import { RegisterRequestDTO, RegisterResponseDTO } from '../dtos/register.dto';
import { UsersRepository } from '../../users/persistance/repository/users.repository';
import { HashingService } from './hashing.service';
import { UniqueConstraintError } from '../../../common/models/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private hashingService: HashingService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginRequest: LoginRequestDTO): Promise<LoginResponseDTO> {
    try {
      const user = await this.usersRepository.getUserByEmail(loginRequest.email);
      const isPasswordCorrect = await this.hashingService.compare(loginRequest.password, user.password);

      if (!isPasswordCorrect) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          audience: this.configService.get('jwt.audience'),
          issuer: this.configService.get('jwt.issuer'),
          secret: this.configService.get('jwt.secret'),
          expiresIn: this.configService.get('jwt.accessTokenTtl'),
        },
      );
      return {
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async register(registerRequest: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    try {
      const user = await this.usersRepository.createUser({
        email: registerRequest.email,
        password: await this.hashingService.hash(registerRequest.password),
      });

      return new RegisterResponseDTO(user);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email already taken');
      }
      throw new InternalServerErrorException(error?.message);
    }
  }
}
