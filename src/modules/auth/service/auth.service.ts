import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDTO } from '../dtos/login.dto';
import { RegisterRequestDTO, RegisterResponseDTO } from '../dtos/register.dto';
import { UsersRepository } from '../../users/persistance/repository/users.repository';
import { HashingService } from './hashing.service';
import { UniqueConstraintError } from '../../../common/models/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private hashingService: HashingService,
  ) {}

  async login(loginRequest: LoginRequestDTO): Promise<boolean> {
    const user = await this.usersRepository.getUserByEmail(loginRequest.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordCorrect = await this.hashingService.compare(loginRequest.password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return true;
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
