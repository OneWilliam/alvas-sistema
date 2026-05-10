CREATE TABLE `ventas_actividad` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_lead` text NOT NULL,
	`evento` text NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas_citas` (
	`id` text PRIMARY KEY NOT NULL,
	`id_lead` text NOT NULL,
	`id_propiedad` text,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado` text NOT NULL,
	`observacion` text
);
--> statement-breakpoint
CREATE TABLE `ventas_clientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text NOT NULL,
	`id_asesor` text NOT NULL,
	`id_lead_origen` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text NOT NULL,
	`tipo` text NOT NULL,
	`estado` text NOT NULL,
	`id_asesor` text NOT NULL,
	`id_cliente` text,
	`id_propiedad_interes` text,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
