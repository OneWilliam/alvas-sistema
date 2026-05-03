import { HashClaveUsuarioInvalidaError } from "../errors";

export class HashClave {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const hashClaveNormalizado = valor.trim();

    if (hashClaveNormalizado.length < 10) {
      throw new HashClaveUsuarioInvalidaError();
    }

    this.valorInterno = hashClaveNormalizado;
  }

  get valor(): string {
    return this.valorInterno;
  }
}
