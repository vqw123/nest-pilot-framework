import { ConfigService } from '@libs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService) {
    const options = this.configService.get('database');

    this.logger.log(options);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
3;
