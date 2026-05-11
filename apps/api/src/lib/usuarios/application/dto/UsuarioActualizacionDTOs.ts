export interface UsuarioOutputDTO {
  id: string;
  nombre: string;
  rol: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ActualizarUsuarioInputDTO {
  idUsuario: string;
  nombre?: string;
  rol?: string;
}
