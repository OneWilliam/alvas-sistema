export interface CrearUsuarioDTO {
  idUsuario: string;
  username: string;
  nombre: string;
  clave: string;
  rol: string;
}

export interface UsuarioRespuestaDTO {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  estado: string;
}
