import { ErrorDeDominio } from "../../../shared/domain";

export class EstadoUsuarioInvalidoError extends ErrorDeDominio {
  constructor(estado: string) {
    super("El estado del usuario no es valido.", {
      codigo: "ESTADO_USUARIO_INVALIDO",
      detalle: { estado },
    });
    this.name = "EstadoUsuarioInvalidoError";
  }
}
