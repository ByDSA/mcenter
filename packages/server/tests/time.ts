const fakeTime = Date.UTC(2000, 0, 1, 0, 0, 0);

// eslint-disable-next-line import/prefer-default-export
export function useFakeTime() {
  jest.useFakeTimers().setSystemTime(fakeTime);
}