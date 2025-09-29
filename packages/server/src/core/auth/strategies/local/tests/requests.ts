import request, { Response } from "supertest";
import { Application } from "express";
import { PATH_ROUTES } from "$sharedSrc/routing";
import { LoginDto, SignUpDto } from "../dto";

type CreateRequestProps = {
  routerApp: Application;
};

export type LoginRequestProps = {
  dto: LoginDto;
  agent?: ReturnType<typeof request>;
};

export const createLoginRequest = ( { routerApp }: CreateRequestProps)=> async ( { dto, agent =
request(routerApp) }: LoginRequestProps): Promise<Response> =>{
  return await agent
    .post(PATH_ROUTES.auth.local.login.path)
    .send(dto);
};

export type SignUpRequestProps = {
  dto: SignUpDto;
  agent?: ReturnType<typeof request>;
};

export const createSignUpRequest = ( { routerApp }: CreateRequestProps)=> async ( { dto, agent =
request(routerApp) }: SignUpRequestProps): Promise<Response> => {
  return await agent
    .post(PATH_ROUTES.auth.local.signup.path)
    .send(dto);
};
