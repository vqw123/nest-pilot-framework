import { HttpStatus } from '@nestjs/common';
import { BaseHttpException, BaseDomainException } from '../src/exceptions/base.exceptions';
import { ErrorResponse } from '../src/responses/error.response';

describe('BaseHttpException', () => {
  it('should set code, message, name correctly', () => {
    const ex = new BaseHttpException('USER_NOT_FOUND', 'User not found');

    expect(ex.code).toBe('USER_NOT_FOUND');
    expect(ex.message).toBe('User not found');
    expect(ex.name).toBe('BaseHttpException');
  });

  it('should default to BAD_REQUEST status', () => {
    const ex = new BaseHttpException('CODE', 'message');

    expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should use custom status when provided', () => {
    const ex = new BaseHttpException('CODE', 'message', HttpStatus.NOT_FOUND);

    expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should contain ErrorResponse as response body', () => {
    const ex = new BaseHttpException('CODE', 'message');

    expect(ex.getResponse()).toBeInstanceOf(ErrorResponse);
  });

  it('subclass should set name to subclass name', () => {
    class UserNotFoundException extends BaseHttpException {
      constructor() {
        super('USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);
      }
    }

    const ex = new UserNotFoundException();

    expect(ex.name).toBe('UserNotFoundException');
  });
});

describe('BaseDomainException', () => {
  it('should set code, message, name correctly', () => {
    const ex = new BaseDomainException('EMAIL_EXISTS', 'Email already exists');

    expect(ex.code).toBe('EMAIL_EXISTS');
    expect(ex.message).toBe('Email already exists');
    expect(ex.name).toBe('BaseDomainException');
  });

  it('should not have HttpStatus property', () => {
    const ex = new BaseDomainException('CODE', 'message');

    expect((ex as any).status).toBeUndefined();
  });

  it('subclass should set name to subclass name', () => {
    class AuthDomainException extends BaseDomainException {}

    const ex = new AuthDomainException('CODE', 'message');

    expect(ex.name).toBe('AuthDomainException');
  });
});
