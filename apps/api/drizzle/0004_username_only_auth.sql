ALTER TABLE usuarios ADD COLUMN username text;

UPDATE usuarios
SET username = lower(id)
WHERE username IS NULL OR trim(username) = '';

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_username_unique ON usuarios(username);
