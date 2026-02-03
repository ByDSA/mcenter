import * as fs from "fs";
import path from "path";
import { Application } from "express";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { HttpStatus } from "@nestjs/common";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { imageCoverEntitySchema } from "$shared/models/image-covers";
import supertest from "supertest";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { uploadImage } from "./utils";
import { ImageCoversUploadModule } from "../module";
import { IMAGE_COVERS_FOLDER_PATH } from "#modules/image-covers/utils";

const sampleFile = Buffer.from(fs.readFileSync(IMAGE_COVERS_FOLDER_PATH + "/sample-nodejs.png"));

describe("imageCoverCrudController e2e", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [ImageCoversUploadModule],
    }, {
      db: {
        using: "real",
      },
      auth: {
        repositories: "mock",
        cookies: "mock",
      },
    } );

    await testingSetup.useMockedUser(fixtureUsers.Admin.UserWithRoles);
    routerApp = testingSetup.routerApp;

    res = await uploadImage( {
      fileBuffer: sampleFile,
      metadata,
      routerApp,
    } );

    body = res.body;
  } );

  let res: supertest.Response;
  let body: ImageCoverCrudDtos.UploadFile.Response;
  const metadata: ImageCoverCrudDtos.UploadFile.RequestBody["metadata"] = {
    label: "Label",
  };

  it("devuelve respuesta correcta", () => {
    expect(res.status).toBe(HttpStatus.OK);

    ImageCoverCrudDtos.UploadFile.responseSchema.parse(res.body);

    imageCoverEntitySchema.parse(body.data.imageCover);

    expect(body.data.imageCover.metadata.label).toBe(metadata.label);
  } );

  it("should save original data in disk", () => {
    const originalPath = path.join(
      IMAGE_COVERS_FOLDER_PATH,
      body.data.imageCover.id.slice(-2),
      body.data.imageCover.versions.original,
    );

    expect(
      fs.existsSync(originalPath),
    ).toBeTruthy();
  } );

  it("should generate image versions", () => {
    expect(body.data.imageCover.versions.large).toBeDefined();
    expect(body.data.imageCover.versions.medium).toBeDefined();
    expect(body.data.imageCover.versions.small).toBeDefined();

    const middleFolder = body.data.imageCover.id.slice(-2);
    const largePath = path.join(
      IMAGE_COVERS_FOLDER_PATH,
      middleFolder,
      body.data.imageCover.versions.large!,
    );
    const mediumPath = path.join(
      IMAGE_COVERS_FOLDER_PATH,
      middleFolder,
      body.data.imageCover.versions.medium!,
    );
    const smallPath = path.join(
      IMAGE_COVERS_FOLDER_PATH,
      middleFolder,
      body.data.imageCover.versions.small!,
    );

    expect(
      fs.existsSync(largePath),
    ).toBeTruthy();
    expect(
      fs.existsSync(mediumPath),
    ).toBeTruthy();
    expect(
      fs.existsSync(smallPath),
    ).toBeTruthy();
  } );

  afterAll(() => {
    const folderPath = IMAGE_COVERS_FOLDER_PATH;

    if (!fs.existsSync(folderPath))
      return;

    const items = fs.readdirSync(folderPath);

    items.forEach(item => {
      if (item === ".gitignore" || item.startsWith("sample-"))
        return;

      const fullPath = path.join(folderPath, item);

      fs.rmSync(fullPath, {
        recursive: true,
        force: true,
      } );
    } );
  } );
} );
