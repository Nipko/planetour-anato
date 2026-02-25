require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database ---------------------------------------------------------------
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

// --- Middleware --------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers ----------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{1,4}\s?\d{7,15}$/;

const VALID_INTERESTS = [
    'Consolidación Aérea',
    'Gecko Aventura Extrema',
    'Hotel Waldorf',
    'Paquetes Amazonas',
    'Paquetes San Andrés',
    'Paquetes Yopal',
];

function validate(body) {
    const errors = {};

    if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim().length === 0 || body.nombre.length > 256)
        errors.nombre = 'Nombre y Apellido es requerido (máx 256 caracteres).';

    if (!body.agencia || typeof body.agencia !== 'string' || body.agencia.trim().length === 0 || body.agencia.length > 200)
        errors.agencia = 'Nombre de Agencia es requerido (máx 200 caracteres).';

    if (!body.cargo || typeof body.cargo !== 'string' || body.cargo.trim().length === 0 || body.cargo.length > 256)
        errors.cargo = 'Cargo es requerido (máx 256 caracteres).';

    if (!body.ciudad || typeof body.ciudad !== 'string' || body.ciudad.trim().length === 0 || body.ciudad.length > 100)
        errors.ciudad = 'Ciudad es requerida (máx 100 caracteres).';

    if (!body.correo || !EMAIL_RE.test(body.correo))
        errors.correo = 'Ingrese un correo electrónico válido.';

    if (!body.telefono || !PHONE_RE.test(body.telefono))
        errors.telefono = 'Ingrese un teléfono válido con código de país (ej: +57 3001234567).';

    if (!Array.isArray(body.interes) || body.interes.length === 0 || !body.interes.every(i => VALID_INTERESTS.includes(i)))
        errors.interes = 'Seleccione al menos un interés válido.';

    if (body.observacion && body.observacion.length > 500)
        errors.observacion = 'La observación no puede exceder 500 caracteres.';

    if (!body.acepta_politica)
        errors.acepta_politica = 'Debe aceptar la política de tratamiento de datos.';

    return errors;
}

// --- Routes -----------------------------------------------------------------
app.post('/api/formulario', async (req, res) => {
    const errors = validate(req.body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ ok: false, errors });
    }

    const { nombre, agencia, cargo, ciudad, correo, telefono, interes, observacion, acepta_politica } = req.body;

    try {
        await pool.query(
            `INSERT INTO formulario (nombre, agencia, cargo, ciudad, correo, telefono, interes, observacion, acepta_politica)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [nombre.trim(), agencia.trim(), cargo.trim(), ciudad.trim(), correo.trim(), telefono.trim(), interes, observacion ? observacion.trim() : null, acepta_politica]
        );
        return res.status(201).json({ ok: true, message: '¡Registro guardado exitosamente!' });
    } catch (err) {
        console.error('DB Error:', err);
        return res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
    }
});

// --- Admin ------------------------------------------------------------------
const ADMIN_KEY = process.env.ADMIN_KEY || 'Pl4n3t0ur_Admin_2026!';

app.post('/api/admin/login', (req, res) => {
    const { key } = req.body;
    if (key === ADMIN_KEY) {
        return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, message: 'Clave incorrecta.' });
});

app.get('/api/admin/registros', (req, res) => {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) {
        return res.status(401).json({ ok: false, message: 'No autorizado.' });
    }

    pool.query('SELECT * FROM formulario ORDER BY created_at DESC')
        .then(result => res.json({ ok: true, data: result.rows, total: result.rowCount }))
        .catch(err => {
            console.error('Admin query error:', err);
            res.status(500).json({ ok: false, message: 'Error interno.' });
        });
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Auto-migrate -----------------------------------------------------------
async function initDB() {
    try {
        await pool.query(`
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
    `);
        console.log('✅ Database ready');
    } catch (err) {
        console.error('❌ DB init error:', err);
        process.exit(1);
    }
}

// --- Start ------------------------------------------------------------------
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
