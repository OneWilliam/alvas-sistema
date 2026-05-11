export interface ActualizarClienteInputDTO {
  idCliente: string;
  nombre?: string;
  email?: string;
  telefono?: string;
}

export interface ClienteOutputDTO {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  idAsesor: string;
  creadoEn: string;
  actualizadoEn: string;
}
