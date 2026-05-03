import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Usuario } from "../../domain/entities";
import { IdUsuario } from "../../domain/value-objects";

export interface IUsuarioRepository
  extends IRepositorioLectura<Usuario, IdUsuario>,
    IRepositorioEscritura<Usuario, IdUsuario> {}
