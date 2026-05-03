CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text DEFAULT 'Usuario' NOT NULL,
	`hash_clave` text NOT NULL,
	`rol` text NOT NULL,
	`estado` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);
