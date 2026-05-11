export interface UsuarioOutputDTO {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ActualizarUsuarioInputDTO {
  idUsuario: string;
  username?: string;
  nombre?: string;
  rol?: string;
}
