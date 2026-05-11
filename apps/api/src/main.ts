import { Hono } from "hono";
import { ErrorDeDominio } from "./lib/shared/domain";
import { crearAuthRouter } from "./lib/auth/infrastructure";
import { IniciarSesionUseCase, RenovarSesionUseCase } from "./lib/auth/application";
import {
  ConsultaCredencialesUsuarioAdapter,
  D1UsuarioRepository,
  VerificadorDeClavePbkdf2Adapter,
  crearUsuarioRouter,
} from "./lib/usuarios/infrastructure";
import {
  ActualizarUsuarioUseCase,
  CrearUsuarioUseCase,
  ListarUsuariosUseCase,
  ObtenerUsuarioUseCase,
} from "./lib/usuarios/application";
import { Pbkdf2PasswordHasher } from "./lib/usuarios/infrastructure/security/Pbkdf2PasswordHasher";
import {
  AutorizadorPropiedadesAdapter,
  D1PropiedadRepository,
  crearPropiedadRouter,
} from "./lib/propiedades/infrastructure";
import { CrearPropiedadUseCase, ListarPropiedadesUseCase } from "./lib/propiedades/application";
import {
  D1VentasRepository,
  crearVentasRouter,
} from "./lib/ventas/infrastructure";
import {
  ActualizarCitaUseCase,
  ActualizarLeadUseCase,
  AgendarCitaUseCase,
  ConvertirLeadAClienteUseCase,
  EvaluarLeadParaAsignarUseCase,
  ListarLeadsPorAsesorUseCase,
  RegistrarClienteDirectoUseCase,
  RegistrarLeadUseCase,
} from "./lib/ventas/application";
import {
  crearReportesRouter,
} from "./lib/reportes/infrastructure";
import {
  ObtenerEstadisticasGlobalesUseCase,
  ObtenerReporteGeneralUseCase,
} from "./lib/reportes/application";
import {
  crearIntegracionesRouter,
} from "./lib/integraciones/infrastructure";
import {
  ProcesarCaptacionEntranteUseCase,
  ProcesarWhatsAppWebhookUseCase,
} from "./lib/integraciones/application";
import { ConsultaVentasParaReportesAdapter } from "./lib/ventas/infrastructure/adapters/ConsultaVentasParaReportesAdapter";
import { RegistroLeadCaptacionVentasAdapter } from "./lib/ventas/infrastructure/adapters/RegistroLeadCaptacionVentasAdapter";
import { type D1DatabaseLike, type SessionClaims } from "./lib/shared/infrastructure";
import { UuidGeneradorId } from "./lib/shared/infrastructure/security/UuidGeneradorId";
import { crearTokenProviderDesdeEnv } from "./lib/auth/infrastructure/security/TokenProviderFactory";

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

const autorizadorPropiedades = new AutorizadorPropiedadesAdapter();

app.get("/health", (c) => c.json({ status: "ok", service: "alvas-api" }));
app.route(
  "/usuarios",
  crearUsuarioRouter({
    crearCrearUsuario: (c) =>
      new CrearUsuarioUseCase(
        new D1UsuarioRepository(c.env.DB),
        new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER),
      ),
    crearListarUsuarios: (c) => new ListarUsuariosUseCase(new D1UsuarioRepository(c.env.DB)),
    crearObtenerUsuario: (c) => new ObtenerUsuarioUseCase(new D1UsuarioRepository(c.env.DB)),
    crearActualizarUsuario: (c) =>
      new ActualizarUsuarioUseCase(new D1UsuarioRepository(c.env.DB)),
  }),
);
app.route(
  "/auth",
  crearAuthRouter({
    crearIniciarSesion: (c) =>
      new IniciarSesionUseCase(
        new ConsultaCredencialesUsuarioAdapter(new D1UsuarioRepository(c.env.DB)),
        new VerificadorDeClavePbkdf2Adapter(c.env.AUTH_PEPPER),
        crearTokenProviderDesdeEnv(c.env),
      ),
    crearRenovarSesion: (c) =>
      new RenovarSesionUseCase(
        new ConsultaCredencialesUsuarioAdapter(new D1UsuarioRepository(c.env.DB)),
        crearTokenProviderDesdeEnv(c.env),
      ),
  }),
);
app.route(
  "/propiedades",
  crearPropiedadRouter({
    autorizador: autorizadorPropiedades,
    controllerDeps: {
      crearCrearPropiedad: (c) =>
        new CrearPropiedadUseCase(
          new D1PropiedadRepository(c.env.DB),
          new UuidGeneradorId(),
          autorizadorPropiedades,
        ),
      crearListarPropiedades: (c) =>
        new ListarPropiedadesUseCase(new D1PropiedadRepository(c.env.DB), autorizadorPropiedades),
    },
  }),
);
app.route(
  "/ventas",
  crearVentasRouter({
    crearRegistrarLead: (c) => {
      const repo = new D1VentasRepository(c.env.DB);
      return new RegistrarLeadUseCase(repo, new UuidGeneradorId(), new EvaluarLeadParaAsignarUseCase(repo));
    },
    crearAgendarCita: (c) => new AgendarCitaUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearRegistrarClienteDirecto: (c) =>
      new RegistrarClienteDirectoUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearConvertirLeadACliente: (c) =>
      new ConvertirLeadAClienteUseCase(new D1VentasRepository(c.env.DB), new UuidGeneradorId()),
    crearActualizarLead: (c) => new ActualizarLeadUseCase(new D1VentasRepository(c.env.DB)),
    crearActualizarCita: (c) => new ActualizarCitaUseCase(new D1VentasRepository(c.env.DB)),
    crearListarLeadsPorAsesor: (c) =>
      new ListarLeadsPorAsesorUseCase(new D1VentasRepository(c.env.DB)),
  }),
);
app.route(
  "/reportes",
  crearReportesRouter({
    crearObtenerEstadisticasGlobales: (c) =>
      new ObtenerEstadisticasGlobalesUseCase(
        new ConsultaVentasParaReportesAdapter(new D1VentasRepository(c.env.DB)),
      ),
    crearObtenerReporteGeneral: (c) =>
      new ObtenerReporteGeneralUseCase(
        new ConsultaVentasParaReportesAdapter(new D1VentasRepository(c.env.DB)),
      ),
  }),
);
app.route(
  "/integraciones",
  crearIntegracionesRouter({
    crearProcesarWhatsAppWebhook: (c) => {
      const repo = new D1VentasRepository(c.env.DB);
      const registrarLead = new RegistrarLeadUseCase(
        repo,
        new UuidGeneradorId(),
        new EvaluarLeadParaAsignarUseCase(repo),
      );
      return new ProcesarWhatsAppWebhookUseCase(new RegistroLeadCaptacionVentasAdapter(registrarLead));
    },
    crearProcesarCaptacionEntrante: (c) => {
      const repo = new D1VentasRepository(c.env.DB);
      const registrarLead = new RegistrarLeadUseCase(
        repo,
        new UuidGeneradorId(),
        new EvaluarLeadParaAsignarUseCase(repo),
      );
      return new ProcesarCaptacionEntranteUseCase(
        new RegistroLeadCaptacionVentasAdapter(registrarLead),
      );
    },
  }),
);

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
