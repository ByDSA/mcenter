import { useAsyncAction } from "#modules/ui-kit/input";

export type Op<R, P> = {
  beforeAction?: ()=> Promise<{ param: P;
shouldDo: boolean; }>;
  action: (param: P)=> Promise<R>;
  afterAction?: (data: R)=> Promise<void>;
};

export function useOpCrud<T, P = undefined>(
  config: Op<T, P>,
) {
  const { done, start, isDoing } = useAsyncAction();
  const { action, beforeAction, afterAction } = config;
  const op = {
    action: async (param: P) => {
      start();

      const ret = await action(param);

      done();

      return ret;
    },
    beforeAction,
    afterAction,
  };

  return {
    op,
    isDoing,
  };
}
