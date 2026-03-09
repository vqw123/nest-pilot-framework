export class ErrorResponse<T = string> {
  constructor(
    public readonly code: T,
    public readonly message: string,
  ) {}

  getResponse() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
