import { type Resultado } from "../../../../shared";
import { type PropiedadError } from "../../../domain/errors/PropiedadError";
import { type Propiedad } from "../../../domain/entities";
import { type CrearPropiedadDTO } from "../../dto/PropiedadDTOs";

export type CrearPropiedadCommand = CrearPropiedadDTO & {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export interface ICrearPropiedad {
  ejecutar(input: CrearPropiedadCommand): Promise<Resultado<Propiedad, PropiedadError>>;
}
