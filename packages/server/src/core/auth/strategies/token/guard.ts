import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { STRATEGY_NAME } from "./strategy";

@Injectable()
export class TokenAuthGuard extends AuthGuard(STRATEGY_NAME) {
  handleRequest(_err: any, user: any, _info: any, _context: any, _status: any) {
    // Ignoramos errores y siempre retornamos el usuario / null
    // Si en la Strategy se devuelve 'user=null', aquí llega 'user=false'
    return user || null;
  }
}
