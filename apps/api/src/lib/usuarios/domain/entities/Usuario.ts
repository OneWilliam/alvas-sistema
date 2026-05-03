import { ErrorDeValidacion } from "../../../shared/domain";
import { HashClaveUsuarioInvalidaError, UsuarioYaDeshabilitadoError } from "../errors";
import { EstadoUsuario, IdUsuario, Nombre, Rol } from "../value-objects";

type PropsUsuario = {
  id: IdUsuario;
  nombre: Nombre;
  hashClave: string;
  rol: Rol;
  estado: EstadoUsuario;
  creadoEn: Date;
  actualizadoEn: Date;
};

type CrearUsuarioParams = {
  id: string;
  nombre: string;
  hashClave: string;
  rol: string;
  estado?: string;
};

type ReconstituirUsuarioParams = {
  id: string;
  nombre: string;
  hashClave: string;
  rol: string;
  estado: string;
  creadoEn: string | Date;
  actualizadoEn: string | Date;
};

export class Usuario {
  private readonly idInterno: IdUsuario;
  private readonly nombreInterno: Nombre;
  private hashClaveInterna: string;
  private rolInterno: Rol;
  private estadoInterno: EstadoUsuario;
  private readonly creadoEnInterno: Date;
  private actualizadoEnInterno: Date;

  private constructor(props: PropsUsuario) {
    this.idInterno = props.id;
    this.nombreInterno = props.nombre;
    this.hashClaveInterna = props.hashClave;
    this.rolInterno = props.rol;
    this.estadoInterno = props.estado;
    this.creadoEnInterno = props.creadoEn;
    this.actualizadoEnInterno = props.actualizadoEn;
  }

  static crear(params: CrearUsuarioParams): Usuario {
    const ahora = new Date();
    const hashClave = this.validarYNormalizarHash(params.hashClave);

    return new Usuario({
      id: new IdUsuario(params.id),
      nombre: new Nombre(params.nombre),
      hashClave,
      rol: new Rol(params.rol),
      estado: params.estado ? new EstadoUsuario(params.estado) : EstadoUsuario.activo(),
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(params: ReconstituirUsuarioParams): Usuario {
    const creadoEn = new Date(params.creadoEn);
    const actualizadoEn = new Date(params.actualizadoEn);

    if (Number.isNaN(creadoEn.getTime()) || Number.isNaN(actualizadoEn.getTime())) {
      throw new ErrorDeValidacion("Las fechas del usuario persistido son invalidas.");
    }

    return new Usuario({
      id: new IdUsuario(params.id),
      nombre: new Nombre(params.nombre),
      hashClave: this.validarYNormalizarHash(params.hashClave),
      rol: new Rol(params.rol),
      estado: new EstadoUsuario(params.estado),
      creadoEn,
      actualizadoEn,
    });
  }

  get id(): IdUsuario {
    return this.idInterno;
  }

  get nombre(): Nombre {
    return this.nombreInterno;
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
    const hashClaveNormalizado = Usuario.validarYNormalizarHash(nuevoHashClave);

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

  private static validarYNormalizarHash(hashClave: string): string {
    const hashNormalizado = hashClave.trim();

    if (hashNormalizado.length < 10) {
      throw new HashClaveUsuarioInvalidaError();
    }

    return hashNormalizado;
  }
}
