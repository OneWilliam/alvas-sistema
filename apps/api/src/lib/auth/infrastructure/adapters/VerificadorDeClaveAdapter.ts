import { type IVerificadorDeClave } from "../../domain/ports/IVerificadorDeClave";
import { type IPasswordHasher } from "../../../usuarios/domain/ports";

export class VerificadorDeClaveAdapter implements IVerificadorDeClave {
  constructor(private readonly passwordHasher: IPasswordHasher) {}

  async comparar(clavePlana: string, hashGuardado: string): Promise<boolean> {
    return this.passwordHasher.comparar(clavePlana, hashGuardado);
  }
}
