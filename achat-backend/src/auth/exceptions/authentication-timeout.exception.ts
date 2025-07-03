import { HttpException } from '@nestjs/common';

export class AuthenticationTimeoutException extends HttpException {
  constructor(message: string = 'Authentication Timeout') {
    super(message, 419);
  }
}

export class TwoFactorRequiredException extends HttpException {
  constructor(message: string = 'Two Factor Authentication Required') {
    super(message, 401);
  }
}
