import { ErrorDeDominio } from "../../../shared/domain";

export class UsuarioYaDeshabilitadoError extends ErrorDeDominio {
  constructor(idUsuario: string) {
    super("El usuario ya se encuentra deshabilitado.", {
      codigo: "USUARIO_YA_DESHABILITADO",
      detalle: { idUsuario },
    });
    this.name = "UsuarioYaDeshabilitadoError";
  }
}
