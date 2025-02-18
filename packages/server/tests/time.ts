const FAKE_TIME = Date.UTC(2000, 0, 1, 0, 0, 0);

export function useFakeTime() {
  jest.useFakeTimers().setSystemTime(FAKE_TIME);
}
