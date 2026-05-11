import { Lead } from "../../domain/entities/Lead";
import { Cita } from "../../domain/entities/Cita";
import { Cliente } from "../../domain/entities/Cliente";
import { type ValorEstadoCita } from "../../domain/entities/Cita";
import { EstadoLead } from "../../domain/value-objects/EstadoLead";
import { TipoVenta } from "../../domain/value-objects/TipoVenta";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { type LeadRow, type ClienteRow, type CitaVentaRow } from "./schema";
import { idLead, idCita, idCliente, idPropiedad } from "../../domain/value-objects/Ids";

export class VentasMapper {
  static leadADominio(row: LeadRow, citasRows: CitaVentaRow[]): Lead {
    return Lead.reconstituir({
      id: idLead(row.id),
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      tipo: new TipoVenta(row.tipo),
      estado: new EstadoLead(row.estado),
      idAsesor: idUsuarioRef(row.idAsesor),
      idCliente: row.idCliente ? idCliente(row.idCliente) : undefined,
      idPropiedadInteres: row.idPropiedadInteres ? idPropiedad(row.idPropiedadInteres) : undefined,
      citas: citasRows.map((r) => this.citaADominio(r)),
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static leadAPersistencia(lead: Lead) {
    return {
      id: lead.id as string,
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.telefono,
      tipo: lead.tipo.valor,
      estado: lead.estado.valor,
      idAsesor: lead.idAsesor as string,
      idCliente: lead.idCliente ? (lead.idCliente as string) : undefined,
      idPropiedadInteres: lead.idPropiedadInteres ? (lead.idPropiedadInteres as string) : undefined,
      creadoEn: lead.creadoEn.toISOString(),
      actualizadoEn: lead.actualizadoEn.toISOString(),
    };
  }

  static citaADominio(row: CitaVentaRow): Cita {
    return Cita.reconstituir({
      id: idCita(row.id),
      idLead: idLead(row.idLead),
      idPropiedad: row.idPropiedad ?? undefined,
      fechaInicio: new Date(row.fechaInicio),
      fechaFin: new Date(row.fechaFin),
      estado: row.estado as ValorEstadoCita,
      observacion: row.observacion ?? undefined,
    });
  }

  static citaAPersistencia(cita: Cita) {
    return {
      id: cita.id as string,
      idLead: cita.idLead as string,
      idPropiedad: cita.idPropiedad,
      fechaInicio: cita.fechaInicio.toISOString(),
      fechaFin: cita.fechaFin.toISOString(),
      estado: cita.estado,
      observacion: cita.observacion,
    };
  }

  static clienteADominio(row: ClienteRow): Cliente {
    return Cliente.reconstituir({
      id: idCliente(row.id),
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      idAsesor: idUsuarioRef(row.idAsesor),
      idLeadOrigen: row.idLeadOrigen ? idLead(row.idLeadOrigen) : undefined,
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static clienteAPersistencia(cliente: Cliente) {
    return {
      id: cliente.id as string,
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      idAsesor: cliente.idAsesor as string,
      idLeadOrigen: cliente.idLeadOrigen,
      creadoEn: cliente.creadoEn.toISOString(),
      actualizadoEn: cliente.actualizadoEn.toISOString(),
    };
  }
}
