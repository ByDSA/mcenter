export interface BrokerEvent<P> {
  readonly type: string;
  readonly payload: P;
}
