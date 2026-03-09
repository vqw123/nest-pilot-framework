import { ErrorResponse } from '../src/responses/error.response';

describe('ErrorResponse', () => {
  it('should return { code, message } without wrapper', () => {
    const response = new ErrorResponse('SOME_CODE', 'some message');

    expect(response.getResponse()).toEqual({
      code: 'SOME_CODE',
      message: 'some message',
    });
  });

  it('should expose code and message as readonly properties', () => {
    const response = new ErrorResponse('CODE', 'message');

    expect(response.code).toBe('CODE');
    expect(response.message).toBe('message');
  });
});
