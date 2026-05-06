import { Lead } from "../../domain/entities";
import { idLead, TipoLead, idUsuarioRef } from "../../domain/value-objects";
import { type LeadRow } from "./schema";

export class LeadMapper {
  static aDominio(row: LeadRow): Lead {
    return Lead.reconstituir({
      id: idLead(row.id),
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      tipo: new TipoLead(row.tipo),
      idAsesor: idUsuarioRef(row.idAsesor),
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static aPersistencia(lead: Lead) {
    return {
      id: lead.id as string,
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.telefono,
      tipo: lead.tipo.valor,
      idAsesor: lead.idAsesor as string,
      creadoEn: lead.creadoEn.toISOString(),
      actualizadoEn: lead.actualizadoEn.toISOString(),
    };
  }
}
