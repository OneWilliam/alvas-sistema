import { ErrorDeDominio } from "../../../shared/domain";

export class RefreshTokenInvalidoError extends ErrorDeDominio {
  constructor() {
    super("El refresh token es invalido.", {
      codigo: "REFRESH_TOKEN_INVALIDO",
    });
    this.name = "RefreshTokenInvalidoError";
  }
}
