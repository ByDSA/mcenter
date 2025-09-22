/* eslint-disable require-await */
import { Injectable } from "@nestjs/common";
import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { UserPass, UserPassesRepository } from "../user-pass";
import { UserPassEntity } from "../user-pass/userPass.entity";
import { fixtureAuthLocal } from "./fixtures";

const userPassData = fixtureAuthLocal.All;

@Injectable()
export class MockUserPassRepository extends createMockClass(UserPassesRepository) {
  constructor() {
    super();

    this.getOneByUsername.mockImplementation(
      async (
        username: string,
      ): Promise<UserPassEntity | null>=> userPassData.find(d=>d.username === username) ?? null,
    );

    this.getOneByUserId.mockImplementation(
      async (
        userId: string,
      ): Promise<UserPassEntity | null>=> userPassData.find(d=>d.userId === userId) ?? null,
    );

    this.createOneAndGet.mockImplementation(
      async (userPass: UserPass): Promise<UserPassEntity> => {
        const newEntity: UserPassEntity = {
          id: new Types.ObjectId().toString(),
          ...userPass,
        };

        userPassData.push(newEntity);

        return newEntity;
      },
    );
  }
}
