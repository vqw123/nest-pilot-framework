export class ErrorResponse<T = number> {
  constructor(
    public readonly code: T,
    public readonly message: string,
  ) {}

  getResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}
