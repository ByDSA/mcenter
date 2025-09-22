import request, { Response } from "supertest";
import { Application } from "express";
import { LoginDto } from "../dto/Login";
import { SignUpDto } from "../dto/SignUp";

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
    .post("/auth/local/login")
    .send(dto);
};

export type SignUpRequestProps = {
  dto: SignUpDto;
  agent?: ReturnType<typeof request>;
};

export const createSignUpRequest = ( { routerApp }: CreateRequestProps)=> async ( { dto, agent =
request(routerApp) }: SignUpRequestProps): Promise<Response> => {
  return await agent
    .post("/auth/local/signup")
    .send(dto);
};
