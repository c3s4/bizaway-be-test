import { IsEmail, MinLength } from 'class-validator';

export class RegisterRequestDTO {
  @IsEmail()
  email: string;
  @MinLength(8)
  password: string;
}

export class RegisterResponseDTO {
  id: string;
  email: string;

  constructor({ id, email }: { id: string; email: string }) {
    this.id = id;
    this.email = email;
  }
}
