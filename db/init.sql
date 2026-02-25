-- Formulario Anato - Database Initialization
CREATE TABLE IF NOT EXISTS formulario (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(256)  NOT NULL,
    agencia         VARCHAR(200)  NOT NULL,
    cargo           VARCHAR(256)  NOT NULL,
    ciudad          VARCHAR(100)  NOT NULL,
    correo          VARCHAR(320)  NOT NULL,
    telefono        VARCHAR(30)   NOT NULL,
    interes         TEXT[]        NOT NULL,
    observacion     VARCHAR(500),
    acepta_politica BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by email
CREATE INDEX IF NOT EXISTS idx_formulario_correo ON formulario (correo);
