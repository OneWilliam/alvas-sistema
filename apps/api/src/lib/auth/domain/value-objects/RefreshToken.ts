import { RefreshTokenInvalidoError } from "../errors";

export class RefreshToken {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const token = valor.trim();

    if (!token) {
      throw new RefreshTokenInvalidoError();
    }

    this.valorInterno = token;
  }

  get valor(): string {
    return this.valorInterno;
  }
}
