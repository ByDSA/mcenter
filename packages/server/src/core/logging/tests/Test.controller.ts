import { Controller, Get, InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";

@Controller("test")
export class TestController {
  @Get("unhandled")
  throwUnhandledError() {
    throw new Error("Test unhandled error for logging");
  }

  @Get("error-500")
  throwError500() {
    throw new InternalServerErrorException();
  }

  @Get("error-423")
  throwError423() {
    throw new UnprocessableEntityException();
  }

  @Get("ok-200")
  ok() {
    return "OK";
  }
}
