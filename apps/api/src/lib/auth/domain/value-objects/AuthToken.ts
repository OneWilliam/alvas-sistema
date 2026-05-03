import { ErrorDeValidacion } from "../../../shared/domain";

export class AuthToken {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const token = valor.trim();

    if (!token) {
      throw new ErrorDeValidacion("El auth token no puede estar vacio.");
    }

    this.valorInterno = token;
  }

  get valor(): string {
    return this.valorInterno;
  }
}
