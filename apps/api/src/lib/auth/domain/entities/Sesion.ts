import { type ValorRolAcceso } from "../value-objects/RolAcceso";

type SesionProps = Readonly<{
  authToken: string;
  refreshToken: string;
  idUsuario: string;
  username: string;
  rol: ValorRolAcceso;
}>;

export class Sesion {
  private constructor(private readonly props: SesionProps) {}

  static abrir(props: SesionProps): Sesion {
    return new Sesion(props);
  }

  get authToken(): string {
    return this.props.authToken;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get idUsuario(): string {
    return this.props.idUsuario;
  }

  get username(): string {
    return this.props.username;
  }

  get rol(): ValorRolAcceso {
    return this.props.rol;
  }
}
