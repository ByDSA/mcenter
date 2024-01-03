import { PublicMethodsOf } from "#shared/utils/types";
import express from "express";
import { InjectionToken, container } from "tsyringe";

/* eslint-disable import/prefer-default-export */
export const getRouterMock: ()=> express.Router = jest.fn(() => express.Router());

export function registerSingletonIfNotAndGet<T>(original: InjectionToken<T>, mock?: InjectionToken<PublicMethodsOf<T>>): T {
  if (!container.isRegistered(original))
    container.registerSingleton<PublicMethodsOf<T>>(original, mock ?? original);

  return container.resolve(original);
}