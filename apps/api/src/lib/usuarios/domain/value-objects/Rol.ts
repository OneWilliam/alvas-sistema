import { ROLES_SISTEMA, type ValorRol } from "../../../shared/domain/types/Roles";
import { RolDeUsuarioInvalidoError } from "../errors";

export const ROLES_USUARIO = ROLES_SISTEMA;
export type ValorRolUsuario = ValorRol;

export class Rol {
  private readonly valorInterno: ValorRolUsuario;

  constructor(valor: string) {
    const rolNormalizado = valor.trim().toUpperCase();

    if (!ROLES_USUARIO.includes(rolNormalizado as ValorRolUsuario)) {
      throw new RolDeUsuarioInvalidoError(valor);
    }

    this.valorInterno = rolNormalizado as ValorRolUsuario;
  }
  // ...

  get valor(): ValorRolUsuario {
    return this.valorInterno;
  }

  esAdmin(): boolean {
    return this.valorInterno === "ADMIN";
  }

  esAsesor(): boolean {
    return this.valorInterno === "ASESOR";
  }
}
