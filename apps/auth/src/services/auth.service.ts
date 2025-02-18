import { ConfigService } from '@config/config/service/config.service';
import { LoggerModule } from '@logger/logger';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get('database'));
  }

  getHello(): string {
    LoggerModule;
    return 'Hello World!';
  }
}
