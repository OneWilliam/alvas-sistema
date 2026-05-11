import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";

export class UsuarioNoEncontradoError extends ErrorDeDominio {
  constructor(email?: string, id?: string) {
    if (email) {
      super(`El usuario con email ${email} no ha sido encontrado.`);
    } else if (id) {
      super(`El usuario con id ${id} no ha sido encontrado.`);
    } else {
      super("Usuario no encontrado.");
    }
  }
}
