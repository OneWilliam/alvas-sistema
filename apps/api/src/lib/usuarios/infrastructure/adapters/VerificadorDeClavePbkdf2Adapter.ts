import { type IVerificadorDeClave } from "../../../auth/domain";
import { Pbkdf2PasswordHasher } from "../security/Pbkdf2PasswordHasher";

export class VerificadorDeClavePbkdf2Adapter implements IVerificadorDeClave {
  private readonly passwordHasher: Pbkdf2PasswordHasher;

  constructor(pepper?: string) {
    this.passwordHasher = new Pbkdf2PasswordHasher(pepper);
  }

  async comparar(clavePlana: string, hashGuardado: string): Promise<boolean> {
    return this.passwordHasher.comparar(clavePlana, hashGuardado);
  }
}
