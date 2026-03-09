import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class TerminationService implements OnModuleDestroy {
  private isTerminating = false;

  onModuleDestroy() {
    this.isTerminating = true;
  }

  get terminating() {
    return this.isTerminating;
  }
}
