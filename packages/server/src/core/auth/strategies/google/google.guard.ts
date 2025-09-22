import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AppPayloadService } from "../jwt";

@Injectable()
export class GoogleGuard extends AuthGuard("google") {
  constructor(private readonly appPayloadService: AppPayloadService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const ret = super.canActivate(context);

    this.appPayloadService.putLastPageFromQuery();

    return ret;
  }
}
