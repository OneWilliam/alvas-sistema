export interface CrearUsuarioDTO {
  idUsuario: string;
  nombre: string;
  clave: string;
  rol: string;
}

export interface UsuarioRespuestaDTO {
  id: string;
  nombre: string;
  rol: string;
  estado: string;
}
