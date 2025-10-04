import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { AppPayload } from "$shared/models/auth";

@Injectable()
export class AppPayloadEncoderService {
  constructor(
    private readonly jwtService: JwtService,
  ) { }

  sign(payload: AppPayload, opts?: JwtSignOptions): string {
    const { exp, iat, ...payloadWithoutExp } = payload;
    const token = this.jwtService.sign(payloadWithoutExp, opts);

    return token;
  }

  decode(jwtToken: string) {
    try {
      this.jwtService.verify(jwtToken);
    } catch {
      return null;
    }
    const json = this.jwtService.decode(jwtToken, {
      json: true,
    } ) as AppPayload;

    return json;
  }
}
