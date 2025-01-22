import { PublicMethodsOf } from "#shared/utils/types";
import express from "express";
import { InjectionToken, container } from "tsyringe";

export const getRouterMock: ()=> express.Router = jest.fn(() => express.Router());

export function registerSingletonIfNotAndGet<T, U extends PublicMethodsOf<T>>(
  original: InjectionToken<T>,
  mock?: InjectionToken<U>,
): U {
  if (!container.isRegistered(original))
    container.registerSingleton<PublicMethodsOf<T>>(original, mock ?? original);

  return container.resolve(original) as unknown as U;
}
