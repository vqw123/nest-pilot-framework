import { AsyncLocalStorage } from 'async_hooks';

export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<Map<string, any>>();

  static run(callback: () => void) {
    this.storage.run(new Map(), callback);
  }

  static set(key: string, value: any) {
    const store = this.storage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  static get(key: string): any {
    const store = this.storage.getStore();
    return store?.get(key) || null;
  }

  static getRequestId(): string {
    return this.get('requestId') || 'UNKNOWN_REQUEST_ID';
  }

  static getClientIp(): string {
    return this.get('ip') || 'UNKNOWN_IP';
  }
}
