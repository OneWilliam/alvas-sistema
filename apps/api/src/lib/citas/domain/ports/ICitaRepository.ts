import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Cita } from "../entities";
import { IdCita, type IdUsuarioRef } from "../value-objects";

export interface ICitaRepository
  extends IRepositorioEscritura<Cita, IdCita>,
    IRepositorioLectura<Cita, IdCita> {
  listarTodos(): Promise<Cita[]>;
  obtenerPorUsuarioYFecha(idUsuario: IdUsuarioRef, inicio: Date, fin: Date): Promise<Cita[]>;
  obtenerPorUsuario(idUsuario: IdUsuarioRef): Promise<Cita[]>;
  obtenerPorLead(idLead: string): Promise<Cita[]>;
  existeTraslape(
    idUsuario: IdUsuarioRef,
    inicio: Date,
    fin: Date,
    idCitaExcluir?: IdCita,
  ): Promise<boolean>;
}
