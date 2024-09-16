export class CreateUserRequestDto {
  email: string;
  password: string;
}

export class CreateUserResponseDto {
  id: string;
  email: string;

  constructor({ id, email }: { id: string; email: string }) {
    this.id = id;
    this.email = email;
  }
}
