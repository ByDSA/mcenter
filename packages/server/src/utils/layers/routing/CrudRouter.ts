import { ArrayOneOrMore } from "#shared/utils/arrays";
import HttpMethod from "#shared/utils/http/HttpMethod";
import { mergeOpts } from "#shared/utils/objects";
import { Handler } from "express";
import { NOT_IMPLEMENTED_HANDLER } from "../../express/handlers";
import Router from "./Router";

type GeneralRoute = {
  method: HttpMethod;
  url: {
    path: string;
  };
  handlers: ArrayOneOrMore<Handler>;
};

type CanReturnEntity = {
  returnEntity: boolean;
};

type CreateOne = CanReturnEntity & GeneralRoute;
type UpdateOneByPk = CanReturnEntity & GeneralRoute;
type DeleteOneByPk = CanReturnEntity & GeneralRoute;

type CrudMethods = {
  createOne?: CreateOne | null;
  readOneByPk?: GeneralRoute | null;
  readMany?: GeneralRoute | null;
  updateOneByPk?: UpdateOneByPk | null;
  deleteOneByPk?: DeleteOneByPk | null;
};

type Params = {
  methods: CrudMethods;
  url: string;
  additionalRoutes?: GeneralRoute[];
};

/*
GET: / | displayHome()
GET: /users | getUsers() // Read all, no criteria
GET: /users/:id | getUserById() // Read one, by pk
POST: /users | createUser() // Create one
PUT: /users/:id | updateUser() // Update one, dto en body
DELETE: /users/:id | deleteUser() // Delete one, by pk
*/

const DefaultParams: Params = {
  url: "/",
  methods: {
    createOne: {
      method: HttpMethod.PUT,
      url: {
        path: "/:id",
      },
      returnEntity: true,
      handlers: [NOT_IMPLEMENTED_HANDLER],
    },
    readOneByPk: {
      method: HttpMethod.GET,
      url: {
        path: "/:id",
      },
      handlers: [NOT_IMPLEMENTED_HANDLER],
    },
    deleteOneByPk: {
      method: HttpMethod.DELETE,
      url: {
        path: "/:id",
      },
      returnEntity: true,
      handlers: [NOT_IMPLEMENTED_HANDLER],
    },
    updateOneByPk: {
      method: HttpMethod.PATCH,
      url: {
        path: "/:id",
      },
      returnEntity: true,
      handlers: [NOT_IMPLEMENTED_HANDLER],
    },
  },
};

export default class CrudRouter extends Router {
  private constructor(params?: Params) {
    const realParams: Params = mergeOpts(DefaultParams, params);
    const { additionalRoutes } = realParams;
    const { createOne, deleteOneByPk, readMany, readOneByPk, updateOneByPk } = realParams.methods;
    const routes = [
      ...(additionalRoutes ?? []),
      createOne,
      deleteOneByPk,
      readMany,
      readOneByPk,
      updateOneByPk].filter(r=>r) as GeneralRoute[];
    const superParams = {
      url: realParams.url,
      routes,
    };

    super(superParams);
  }
}

export function createCrudRouter(params?: Params): CrudRouter {
  return new (CrudRouter as any)(params);
}
