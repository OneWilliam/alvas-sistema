import { ErrorDeDominio } from "../../../shared/domain";

export class RolDeUsuarioInvalidoError extends ErrorDeDominio {
  constructor(rol: string) {
    super("El rol del usuario no es valido.", {
      codigo: "ROL_USUARIO_INVALIDO",
      detalle: { rol },
    });
    this.name = "RolDeUsuarioInvalidoError";
  }
}
