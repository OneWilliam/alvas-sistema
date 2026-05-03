import { HashClaveUsuarioInvalidaError, UsuarioYaDeshabilitadoError } from "../errors";
import { EstadoUsuario, IdUsuario, Rol } from "../value-objects";

type PropsUsuario = {
  id: IdUsuario;
  hashClave: string;
  rol: Rol;
  estado: EstadoUsuario;
  creadoEn: Date;
  actualizadoEn: Date;
};

type CrearUsuarioParams = {
  id: string;
  hashClave: string;
  rol: string;
  estado?: string;
};

export class Usuario {
  private readonly idInterno: IdUsuario;
  private hashClaveInterna: string;
  private rolInterno: Rol;
  private estadoInterno: EstadoUsuario;
  private readonly creadoEnInterno: Date;
  private actualizadoEnInterno: Date;

  private constructor(props: PropsUsuario) {
    this.idInterno = props.id;
    this.hashClaveInterna = props.hashClave;
    this.rolInterno = props.rol;
    this.estadoInterno = props.estado;
    this.creadoEnInterno = props.creadoEn;
    this.actualizadoEnInterno = props.actualizadoEn;
  }

  static crear(params: CrearUsuarioParams): Usuario {
    const ahora = new Date();
    const hashClave = params.hashClave.trim();

    if (hashClave.length < 10) {
      throw new HashClaveUsuarioInvalidaError();
    }

    return new Usuario({
      id: new IdUsuario(params.id),
      hashClave,
      rol: new Rol(params.rol),
      estado: params.estado ? new EstadoUsuario(params.estado) : EstadoUsuario.activo(),
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  get id(): IdUsuario {
    return this.idInterno;
  }

  get rol(): Rol {
    return this.rolInterno;
  }

  get hashClave(): string {
    return this.hashClaveInterna;
  }

  get estado(): EstadoUsuario {
    return this.estadoInterno;
  }

  get creadoEn(): Date {
    return this.creadoEnInterno;
  }

  get actualizadoEn(): Date {
    return this.actualizadoEnInterno;
  }

  cambiarRol(nuevoRol: string): void {
    this.rolInterno = new Rol(nuevoRol);
    this.actualizadoEnInterno = new Date();
  }

  cambiarHashClave(nuevoHashClave: string): void {
    const hashClaveNormalizado = nuevoHashClave.trim();

    if (hashClaveNormalizado.length < 10) {
      throw new HashClaveUsuarioInvalidaError();
    }

    this.hashClaveInterna = hashClaveNormalizado;
    this.actualizadoEnInterno = new Date();
  }

  deshabilitar(): void {
    if (this.estadoInterno.estaDeshabilitado()) {
      throw new UsuarioYaDeshabilitadoError(this.idInterno.valor);
    }

    this.estadoInterno = EstadoUsuario.deshabilitado();
    this.actualizadoEnInterno = new Date();
  }
}
