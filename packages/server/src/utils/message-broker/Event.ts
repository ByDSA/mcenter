export interface Event<P> {
  readonly type: string;
  readonly payload: P;
}
