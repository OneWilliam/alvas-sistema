import { AuthToken, RefreshToken } from "../../domain/value-objects";
import { type PayloadToken } from "../../domain/types/PayloadToken";

export interface ITokenProvider {
  generarAuthToken(payload: PayloadToken): Promise<AuthToken> | AuthToken;
  generarRefreshToken(payload: PayloadToken): Promise<RefreshToken> | RefreshToken;
  validarAuthToken(token: AuthToken): Promise<PayloadToken> | PayloadToken;
  validarRefreshToken(token: RefreshToken): Promise<PayloadToken> | PayloadToken;
}
