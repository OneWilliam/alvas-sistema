import { Contrato } from "../entities/Contrato";
import { type IdContrato, type IdCliente } from "../value-objects/Ids";

export interface IContratoRepository {
  buscarPorId(id: IdContrato): Promise<Contrato | null>;
  guardar(contrato: Contrato): Promise<void>;
  listar(): Promise<Contrato[]>;
  listarPorCliente(idCliente: IdCliente): Promise<Contrato[]>;
}
