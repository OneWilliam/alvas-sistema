import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Propiedad } from "../entities/Propiedad";
import { type IdPropiedad } from "../value-objects/Ids";

export interface IPropiedadRepository
  extends
    IRepositorioLectura<Propiedad, IdPropiedad>,
    IRepositorioEscritura<Propiedad, IdPropiedad> {
  listarTodas(): Promise<Propiedad[]>;
}
