export default interface Database {
  init(): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
