import { RolDeUsuarioInvalidoError } from "../errors";

export const ROLES_USUARIO = ["ADMIN", "ASESOR"] as const;
export type ValorRolUsuario = (typeof ROLES_USUARIO)[number];

export class Rol {
  private readonly valorInterno: ValorRolUsuario;

  constructor(valor: string) {
    const rolNormalizado = valor.trim().toUpperCase();

    if (!ROLES_USUARIO.includes(rolNormalizado as ValorRolUsuario)) {
      throw new RolDeUsuarioInvalidoError(valor);
    }

    this.valorInterno = rolNormalizado as ValorRolUsuario;
  }

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
