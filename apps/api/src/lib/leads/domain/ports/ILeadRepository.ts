import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Lead } from "../entities/Lead";
import { type IdLead } from "../value-objects/IdLead";
import { type IdUsuarioRef } from "../value-objects";

export interface ILeadRepository
  extends IRepositorioLectura<Lead, IdLead>,
    IRepositorioEscritura<Lead, IdLead> {
  listarTodos(): Promise<Lead[]>;
  obtenerPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]>;
}
