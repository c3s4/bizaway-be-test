import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { LoginRequestDTO, LoginResponseDTO } from './dtos/login.dto';
import { RegisterResponseDTO } from './dtos/register.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestDTO: LoginRequestDTO): Promise<LoginResponseDTO> {
    return await this.authService.login(loginRequestDTO);
  }

  @Post('register')
  async register(@Body() registerRequestDTO: LoginRequestDTO): Promise<RegisterResponseDTO> {
    return await this.authService.register(registerRequestDTO);
  }
}
