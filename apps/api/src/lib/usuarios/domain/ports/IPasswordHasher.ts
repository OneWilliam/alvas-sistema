export interface IPasswordHasher {
  hashear(clavePlana: string): Promise<string>;
  comparar(clavePlana: string, hashGuardado: string): Promise<boolean>;
}
