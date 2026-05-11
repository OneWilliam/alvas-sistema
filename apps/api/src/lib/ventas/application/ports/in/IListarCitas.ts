import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cita } from "../../../domain/entities/Cita";

export interface IListarCitas {
  ejecutar(): Promise<Resultado<Cita[], ErrorDeDominio>>;
}
