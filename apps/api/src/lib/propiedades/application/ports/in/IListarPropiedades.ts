import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Propiedad } from "../../../domain/entities";

export type ListarPropiedadesQuery = Readonly<{
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
}>;

export interface IListarPropiedades {
  ejecutar(input: ListarPropiedadesQuery): Promise<Resultado<Propiedad[], ErrorDeDominio>>;
}
