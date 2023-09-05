import express from "express";

/* eslint-disable import/prefer-default-export */
export const getRouterMock: ()=> express.Router = jest.fn(() => express.Router());