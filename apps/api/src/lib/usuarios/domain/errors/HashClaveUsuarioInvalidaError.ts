import { ErrorDeDominio } from "../../../shared/domain";

export class HashClaveUsuarioInvalidaError extends ErrorDeDominio {
  constructor() {
    super("El hash de clave del usuario no es valido.", {
      codigo: "HASH_CLAVE_USUARIO_INVALIDA",
    });
    this.name = "HashClaveUsuarioInvalidaError";
  }
}
