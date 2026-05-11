import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type EstadisticasGlobalesOutput } from "../../dto/ReportesSalidaDTOs";

export interface IObtenerEstadisticasGlobales {
  ejecutar(): Promise<Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>>;
}
