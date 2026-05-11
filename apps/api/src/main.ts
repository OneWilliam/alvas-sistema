import { Hono } from "hono";
import { ErrorDeDominio } from "./lib/shared/domain";
import { crearAuthRouter } from "./lib/auth/infrastructure";
import { crearUsuarioRouter } from "./lib/usuarios/infrastructure";
import { crearPropiedadRouter } from "./lib/propiedades/infrastructure";
import { crearVentasRouter } from "./lib/ventas/infrastructure";
import { crearReportesRouter } from "./lib/reportes/infrastructure";
import { crearIntegracionesRouter } from "./lib/integraciones/infrastructure";
import {
  crearAuthControllerDeps,
  crearIntegracionesRouterDeps,
  crearPropiedadRouterDeps,
  crearReportesRouterDeps,
  crearUsuarioControllerDeps,
  crearVentasControllerDeps,
} from "./composition";
import { type D1DatabaseLike, type SessionClaims } from "./lib/shared/infrastructure";

type AppBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
  INTEGRACION_WHATSAPP_SECRETO?: string;
};

type AppVariables = {
  authPayload: SessionClaims;
};

const app = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

app.get("/health", (c) => c.json({ status: "ok", service: "alvas-api" }));
app.route("/usuarios", crearUsuarioRouter(crearUsuarioControllerDeps()));
app.route("/auth", crearAuthRouter(crearAuthControllerDeps()));
app.route("/propiedades", crearPropiedadRouter(crearPropiedadRouterDeps()));
app.route("/ventas", crearVentasRouter(crearVentasControllerDeps()));
app.route("/reportes", crearReportesRouter(crearReportesRouterDeps()));
app.route("/integraciones", crearIntegracionesRouter(crearIntegracionesRouterDeps()));

app.onError((error, c) => {
  if (error instanceof ErrorDeDominio) {
    const status =
      error.codigo === "USUARIO_YA_EXISTE"
        ? 409
        : error.codigo === "AUTH_TOKEN_INVALIDO" ||
            error.codigo === "REFRESH_TOKEN_INVALIDO" ||
            error.codigo === "CREDENCIALES_INVALIDAS"
          ? 401
          : error.codigo === "ROL_NO_PERMITIDO"
            ? 403
            : 400;

    return c.json(
      {
        success: false,
        message: error.message,
        code: error.codigo,
      },
      status,
    );
  }

  return c.json(
    {
      success: false,
      message: "Error interno del servidor.",
    },
    500,
  );
});

export default app;
