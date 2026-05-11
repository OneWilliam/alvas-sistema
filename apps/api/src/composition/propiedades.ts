import { CrearPropiedadUseCase, ListarPropiedadesUseCase } from "../lib/propiedades/application";
import {
  AutorizadorPropiedadesAdapter,
  D1PropiedadRepository,
  type PropiedadRouterDeps,
} from "../lib/propiedades/infrastructure";
import { UuidGeneradorId } from "../lib/shared/infrastructure/security/UuidGeneradorId";

export function crearPropiedadRouterDeps(): PropiedadRouterDeps {
  const autorizador = new AutorizadorPropiedadesAdapter();

  return {
    autorizador,
    controllerDeps: {
      crearCrearPropiedad: (c) =>
        new CrearPropiedadUseCase(
          new D1PropiedadRepository(c.env.DB),
          new UuidGeneradorId(),
          autorizador,
        ),
      crearListarPropiedades: (c) =>
        new ListarPropiedadesUseCase(new D1PropiedadRepository(c.env.DB), autorizador),
    },
  };
}
