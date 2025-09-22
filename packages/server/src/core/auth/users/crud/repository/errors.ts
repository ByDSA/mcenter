import { ConflictException } from "@nestjs/common";

const dupEmailPattern = /^E11000 duplicate key error collection: \S+ index: \S+ dup key: \{ email: "[^"]+" \}$/;

export class AlreadyExistsEmail extends ConflictException {
  constructor() {
    super("Email already exists");
  }
}

export const isMongoErrorDupEmail = (e: unknown) => e instanceof Error
  && dupEmailPattern.test(e.message);
