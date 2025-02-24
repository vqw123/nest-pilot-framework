export class ResponseError {
  constructor(
    public code: number,
    public message: string,
  ) {}

  toJSON() {
    return { error: { code: this.code, message: this.message } };
  }
}
