import { ErrorDeDominio } from "../../../shared/domain";

export class CredencialesInvalidasError extends ErrorDeDominio {
  constructor() {
    super("Las credenciales son invalidas.", {
      codigo: "CREDENCIALES_INVALIDAS",
    });
    this.name = "CredencialesInvalidasError";
  }
}
