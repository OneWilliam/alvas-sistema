import { ErrorDeDominio } from "../../../shared/domain";

export class IdUsuarioInvalidoError extends ErrorDeDominio {
  constructor(idUsuario: string) {
    super("El id del usuario no es valido.", {
      codigo: "ID_USUARIO_INVALIDO",
      detalle: { idUsuario },
    });
    this.name = "IdUsuarioInvalidoError";
  }
}
