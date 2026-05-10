import { Contrato } from "../entities/Contrato";
import { type IdContrato } from "../value-objects/Ids";

export interface IContratoRepository {
  buscarPorId(id: IdContrato): Promise<Contrato | null>;
  guardar(contrato: Contrato): Promise<void>;
}
