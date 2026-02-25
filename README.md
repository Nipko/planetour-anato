# 🌎 Formulario Vitrina Turística ANATO 2026

> Formulario de registro web para la Vitrina Turística ANATO 2026 – *'Colombia abierta al mundo'*

![Planetour](logo_planetour.png)

## Tecnologías

| Componente | Tecnología |
|-----------|-----------|
| Frontend  | HTML5, CSS3, JavaScript (Vanilla) |
| Backend   | Node.js 20 + Express |
| Base de datos | PostgreSQL 16 |
| Deploy    | Docker + Portainer |
| CI/CD     | GitHub Actions |

## Inicio Rápido

### Requisitos
- Docker & Docker Compose
- Git

### Ejecución local
```bash
# Clonar el repositorio
git clone https://github.com/Nipko/planetour-anato.git
cd planetour-anato

# Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Construir e iniciar
docker compose up -d --build

# Abrir en el navegador
# http://localhost:3000
```

### Despliegue en Portainer
1. Crear un nuevo **Stack** en Portainer
2. Opción A: apuntar al repositorio de GitHub
3. Opción B: pegar el contenido de `docker-compose.yml`
4. Agregar las variables de entorno del `.env`
5. Desplegar

## CI/CD

El pipeline de GitHub Actions (`.github/workflows/deploy.yml`) se ejecuta en cada push a `main`:

1. **Build** → Construye la imagen Docker
2. **Push** → Sube a Docker Hub
3. **Deploy** → Trigger al webhook de Portainer (opcional)

### Secrets requeridos

| Secret | Descripción |
|--------|-------------|
| `DOCKER_USERNAME` | Usuario de Docker Hub |
| `DOCKER_PASSWORD` | Token de acceso de Docker Hub |
| `PORTAINER_WEBHOOK_URL` | URL del webhook de Portainer (opcional) |

## Estructura del Proyecto

```
formulario_anato/
├── .github/workflows/deploy.yml   # CI/CD
├── db/init.sql                    # Script SQL inicial
├── public/
│   ├── css/styles.css             # Estilos
│   ├── js/app.js                  # Lógica de validación
│   ├── img/                       # Logos
│   ├── index.html                 # Formulario principal
│   ├── politica-datos.html        # Política de datos
│   └── terminos.html              # Términos y condiciones
├── server/
│   ├── index.js                   # API Express
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Enlaces

- 🔗 [Linktree Planetour](https://linktr.ee/planetour)

## Licencia

© 2026 Planetour S.A.S. Todos los derechos reservados.
