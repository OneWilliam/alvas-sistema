import { ErrorDeValidacion } from "../../../shared/domain";

export class OrigenCaptacion {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const normalizado = valor.trim();

    if (!normalizado) {
      throw new ErrorDeValidacion("El origen de captacion es obligatorio.");
    }

    this.valorInterno = normalizado;
  }

  get valor(): string {
    return this.valorInterno;
  }
}
