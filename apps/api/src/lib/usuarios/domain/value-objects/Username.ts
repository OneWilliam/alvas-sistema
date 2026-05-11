import { ErrorDeValidacion } from "../../../shared/domain";

export class Username {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const usernameNormalizado = valor.trim().toLowerCase();

    if (usernameNormalizado.length < 3) {
      throw new ErrorDeValidacion("El username debe tener al menos 3 caracteres.");
    }

    if (usernameNormalizado.length > 50) {
      throw new ErrorDeValidacion("El username no puede exceder los 50 caracteres.");
    }

    if (!/^[a-z0-9._-]+$/.test(usernameNormalizado)) {
      throw new ErrorDeValidacion(
        "El username solo puede contener letras, numeros, puntos, guiones y guion bajo.",
      );
    }

    this.valorInterno = usernameNormalizado;
  }

  get valor(): string {
    return this.valorInterno;
  }

  toString(): string {
    return this.valorInterno;
  }
}
