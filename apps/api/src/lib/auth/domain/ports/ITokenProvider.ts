import { AuthToken, RefreshToken } from "../../domain/value-objects";
import { type SessionClaims } from "../../../shared/infrastructure/session";

export interface ITokenProvider {
  generarAuthToken(payload: SessionClaims): Promise<AuthToken> | AuthToken;
  generarRefreshToken(payload: SessionClaims): Promise<RefreshToken> | RefreshToken;
  validarAuthToken(token: AuthToken): Promise<SessionClaims> | SessionClaims;
  validarRefreshToken(token: RefreshToken): Promise<SessionClaims> | SessionClaims;
}
