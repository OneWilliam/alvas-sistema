import {
  ActualizarPropiedadUseCase,
  CrearPropiedadUseCase,
  EliminarPropiedadUseCase,
  ListarPropiedadesUseCase,
} from "../lib/propiedades/application";
import {
  AutorizadorPropiedadesAdapter,
  ConsultaRelacionPropiedadVentasAdapter,
  D1PropiedadRepository,
  type PropiedadRouterDeps,
} from "../lib/propiedades/infrastructure";
import { type D1DatabaseLike } from "../lib/shared/infrastructure";
import { UuidGeneradorId } from "../lib/shared/infrastructure/security/UuidGeneradorId";
import { D1VentasRepository } from "../lib/ventas/infrastructure";

export function crearPropiedadRouterDeps(): PropiedadRouterDeps {
  const autorizador = new AutorizadorPropiedadesAdapter();
  const crearConsultaRelacionPropiedad = (db: D1DatabaseLike) =>
    new ConsultaRelacionPropiedadVentasAdapter(new D1VentasRepository(db));

  return {
    autorizador,
    controllerDeps: {
      crearCrearPropiedad: (c) =>
        new CrearPropiedadUseCase(
          new D1PropiedadRepository(c.env.DB),
          new UuidGeneradorId(),
          autorizador,
          crearConsultaRelacionPropiedad(c.env.DB),
        ),
      crearListarPropiedades: (c) =>
        new ListarPropiedadesUseCase(new D1PropiedadRepository(c.env.DB), autorizador),
      crearActualizarPropiedad: (c) =>
        new ActualizarPropiedadUseCase(
          new D1PropiedadRepository(c.env.DB),
          autorizador,
          crearConsultaRelacionPropiedad(c.env.DB),
        ),
      crearEliminarPropiedad: (c) =>
        new EliminarPropiedadUseCase(new D1PropiedadRepository(c.env.DB), autorizador),
    },
  };
}
