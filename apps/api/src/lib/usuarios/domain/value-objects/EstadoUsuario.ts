import { EstadoUsuarioInvalidoError } from "../errors";

export const ESTADOS_USUARIO = ["ACTIVO", "DESHABILITADO"] as const;
export type ValorEstadoUsuario = (typeof ESTADOS_USUARIO)[number];

export class EstadoUsuario {
  private readonly valorInterno: ValorEstadoUsuario;

  constructor(valor: string) {
    const estadoNormalizado = valor.trim().toUpperCase();

    if (!ESTADOS_USUARIO.includes(estadoNormalizado as ValorEstadoUsuario)) {
      throw new EstadoUsuarioInvalidoError(valor);
    }

    this.valorInterno = estadoNormalizado as ValorEstadoUsuario;
  }

  static activo(): EstadoUsuario {
    return new EstadoUsuario("ACTIVO");
  }

  static deshabilitado(): EstadoUsuario {
    return new EstadoUsuario("DESHABILITADO");
  }

  get valor(): ValorEstadoUsuario {
    return this.valorInterno;
  }

  estaActivo(): boolean {
    return this.valorInterno === "ACTIVO";
  }

  estaDeshabilitado(): boolean {
    return this.valorInterno === "DESHABILITADO";
  }
}
