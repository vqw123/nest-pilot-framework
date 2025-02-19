import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(@Inject('CONFIG') private readonly config: Record<string, any>) {}

  get<T = any>(key: string): T | undefined {
    return key
      .split('.')
      .reduce<
        Record<string, any> | undefined
      >((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), this.config) as
      | T
      | undefined;
  }
}
