import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Usuario } from "../entities";
import { IdUsuario } from "../value-objects";

export interface IUsuarioRepository
  extends IRepositorioLectura<Usuario, IdUsuario>,
    IRepositorioEscritura<Usuario, IdUsuario> {}
