const fakeTime = Date.UTC(2000, 0, 1, 0, 0, 0);

export function useFakeTime() {
  jest.useFakeTimers().setSystemTime(fakeTime);
}
