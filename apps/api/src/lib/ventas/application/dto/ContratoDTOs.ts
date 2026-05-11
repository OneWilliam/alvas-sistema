export interface CrearContratoInputDTO {
  id: string;
  idCliente: string;
  idPropiedad: string;
  fechaInicio: Date;
  fechaFin: Date;
  idAsesor?: string;
}

export interface ContratoOutputDTO {
  id: string;
  idCliente: string;
  idPropiedad: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarContratosOutputDTO {
  contratos: ContratoOutputDTO[];
}
