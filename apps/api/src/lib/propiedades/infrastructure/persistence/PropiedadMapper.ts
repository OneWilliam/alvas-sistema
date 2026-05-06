import { Propiedad } from "../../domain/entities";
import { idPropiedad, idUsuarioRef } from "../../domain/value-objects";
import { type PropiedadRow } from "./schema";

export class PropiedadMapper {
  static aDominio(row: PropiedadRow): Propiedad {
    return Propiedad.reconstituir({
      id: idPropiedad(row.id),
      titulo: row.titulo,
      descripcion: row.descripcion,
      precio: row.precio,
      idAsesor: idUsuarioRef(row.idAsesor),
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static aPersistencia(propiedad: Propiedad) {
    return {
      id: propiedad.id as string,
      titulo: propiedad.titulo,
      descripcion: propiedad.descripcion,
      precio: propiedad.precio,
      idAsesor: propiedad.idAsesor as string,
      creadoEn: propiedad.creadoEn.toISOString(),
      actualizadoEn: propiedad.actualizadoEn.toISOString(),
    };
  }
}
