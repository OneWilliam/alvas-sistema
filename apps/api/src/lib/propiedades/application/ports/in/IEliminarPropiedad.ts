import { type Resultado } from "../../../../shared";
import { type PropiedadError } from "../../../domain/errors/PropiedadError";
import { type EliminarPropiedadInput } from "../../use-cases/EliminarPropiedadUseCase";

export interface IEliminarPropiedad {
  ejecutar(input: EliminarPropiedadInput): Promise<Resultado<void, PropiedadError>>;
}
