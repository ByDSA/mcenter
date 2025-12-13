import { SetState } from "../useCrud";
import { Op, useOpCrud } from "./op";

export function useUpdateCrud<T, P>(params: {
  config: Op<T, P>;
  isModified: boolean;
  setData: SetState<T>;
  reset: (newData?: T)=> Promise<void>;
} ) {
  const { config, isModified, reset, setData } = params;
  const { action, afterAction, beforeAction } = config;
  const { op, isDoing } = useOpCrud( {
    action,
    beforeAction: async () => {
      if (beforeAction) {
        const userCheck = await beforeAction();

        return {
          shouldDo: userCheck.shouldDo && isModified,
          param: userCheck.param,
        };
      }

      return {
        shouldDo: isModified,
        param: undefined,
      };
    },
    afterAction: async (newData)=> {
      await afterAction?.(newData);

      setData(newData);
      await reset(newData);
    },
  } );

  return {
    op: op,
    isDoing: isDoing,
  };
}
