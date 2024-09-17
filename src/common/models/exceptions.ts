export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = NotFoundError.name;
  }
}

export class UniqueConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = UniqueConstraintError.name;
  }
}
