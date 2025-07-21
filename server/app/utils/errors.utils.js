export class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
    this.statusCode = 500;
  }
}

export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}
