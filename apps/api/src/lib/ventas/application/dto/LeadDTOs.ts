export interface ObtenerLeadInputDTO {
  id: string;
}

export interface ActualizarLeadInputDTO {
  id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
}

export interface CrearContratoInputDTO {
  id: string;
  idCliente: string;
  idPropiedad: string;
  fechaInicio: Date;
  fechaFin: Date;
  idAsesor?: string;
}

export interface AsignarLeadAAsesorInputDTO {
  idLead: string;
  idAsesor: string;
}

export interface ObtenerCitaPorIdInputDTO {
  idLead: string;
  idCita: string;
}

export interface ActualizarClienteInputDTO {
  idUsuario: string;
  nombre?: string;
  email?: string;
  telefono?: string;
}
