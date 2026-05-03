import { IdUsuarioInvalidoError } from "../errors";

export class IdUsuario {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const idNormalizado = valor.trim();

    if (idNormalizado.length < 5) {
      throw new IdUsuarioInvalidoError(valor);
    }

    this.valorInterno = idNormalizado;
  }

  get valor(): string {
    return this.valorInterno;
  }

  esIgual(otro: IdUsuario): boolean {
    return this.valorInterno === otro.valorInterno;
  }

  toString(): string {
    return this.valorInterno;
  }
}
