import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Propiedad } from "../entities/Propiedad";
import { type IdPropiedad } from "../value-objects/Ids";
import { type IdUsuarioRef } from "../value-objects";

export interface IPropiedadRepository
  extends IRepositorioLectura<Propiedad, IdPropiedad>,
    IRepositorioEscritura<Propiedad, IdPropiedad> {
  listarTodas(): Promise<Propiedad[]>;
  obtenerPorAsesor(idAsesor: IdUsuarioRef): Promise<Propiedad[]>;
}
