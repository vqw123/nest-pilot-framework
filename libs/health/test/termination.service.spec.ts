import { TerminationService } from '../src/termination/termination.service';

describe('TerminationService', () => {
  it('should not be terminating on init', () => {
    const service = new TerminationService();

    expect(service.terminating).toBe(false);
  });

  it('should be terminating after onModuleDestroy', () => {
    const service = new TerminationService();

    service.onModuleDestroy();

    expect(service.terminating).toBe(true);
  });
});
