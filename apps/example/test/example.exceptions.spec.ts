import { HttpStatus } from '@nestjs/common';
import { ExampleErrorCode, ExampleNotFoundException } from '../src/exceptions/example.exceptions';

describe('ExampleNotFoundException', () => {
  it('should have correct error code', () => {
    const error = new ExampleNotFoundException(1);
    expect(error.code).toBe(ExampleErrorCode.NOT_FOUND);
  });

  it('should have correct HTTP status', () => {
    const error = new ExampleNotFoundException(1);
    expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should include id in message', () => {
    const error = new ExampleNotFoundException(42);
    expect(error.message).toContain('42');
  });
});
