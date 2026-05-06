CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text NOT NULL,
	`tipo` text NOT NULL,
	`id_asesor` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `propiedades` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text NOT NULL,
	`precio` integer NOT NULL,
	`id_asesor` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
