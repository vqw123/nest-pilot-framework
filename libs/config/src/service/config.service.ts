import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(@Inject('CONFIG') private readonly config: Record<string, any>) {}

  get<T>(key: string, defaultValue?: T): T {
    return this.config[key] ?? defaultValue;
  }
}
