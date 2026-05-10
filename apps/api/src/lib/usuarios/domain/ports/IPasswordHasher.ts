import { type HashClave } from "../../domain/value-objects";

export interface IPasswordHasher {
  hashear(clavePlana: string): Promise<HashClave>;
  comparar(clavePlana: string, hashGuardado: string): Promise<boolean>;
}
