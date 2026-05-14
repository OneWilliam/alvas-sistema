import { Propiedad, type EstadoPropiedad, type OrigenPropiedad } from "../../domain/entities";
import { idPropiedad, idUsuarioRef } from "../../domain/value-objects";
import { type PropiedadRow } from "./schema";

export class PropiedadMapper {
  static aDominio(row: PropiedadRow): Propiedad {
    return Propiedad.reconstituir({
      id: idPropiedad(row.id),
      titulo: row.titulo,
      descripcion: row.descripcion,
      precio: row.precio,
      origen: row.origen as OrigenPropiedad,
      estado: row.estado as EstadoPropiedad,
      idLeadOrigen: row.idLeadOrigen ?? undefined,
      idClientePropietario: row.idClientePropietario ?? undefined,
      captadaPorAsesorId: row.captadaPorAsesorId ? idUsuarioRef(row.captadaPorAsesorId) : undefined,
      asesorResponsableId: row.asesorResponsableId
        ? idUsuarioRef(row.asesorResponsableId)
        : undefined,
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
      origen: propiedad.origen,
      estado: propiedad.estado,
      idLeadOrigen: propiedad.idLeadOrigen,
      idClientePropietario: propiedad.idClientePropietario,
      captadaPorAsesorId: propiedad.captadaPorAsesorId,
      asesorResponsableId: propiedad.asesorResponsableId,
      creadoEn: propiedad.creadoEn.toISOString(),
      actualizadoEn: propiedad.actualizadoEn.toISOString(),
    };
  }
}
