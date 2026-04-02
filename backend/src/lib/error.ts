import { HttpStatus } from "./http";

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(HttpStatus.HTTP_400_BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(HttpStatus.HTTP_401_UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(HttpStatus.HTTP_403_FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(HttpStatus.HTTP_404_NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(HttpStatus.HTTP_409_CONFLICT, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(HttpStatus.HTTP_500_INTERNAL_SERVER_ERROR, message);
  }
}
