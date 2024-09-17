import { IsEmail, MinLength } from 'class-validator';

export class LoginRequestDTO {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
