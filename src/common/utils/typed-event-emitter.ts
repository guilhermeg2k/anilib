import { EventEmitter } from 'events';

export class TypedEventEmitter<T extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<U extends keyof T & string>(eventName: U, ...eventArg: T[U]) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  on<U extends keyof T & string>(
    eventName: U,
    handler: (...eventArg: T[U]) => void
  ) {
    this.emitter.on(eventName, handler as any);
  }

  off<U extends keyof T & string>(
    eventName: U,
    handler: (...eventArg: T[U]) => void
  ) {
    this.emitter.off(eventName, handler as any);
  }
}
