export interface IVerificadorDeClave {
  comparar(clavePlana: string, hashGuardado: string): Promise<boolean>;
}
