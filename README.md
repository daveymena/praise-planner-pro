<<<<<<< HEAD
# 🎵 Praise Planner Pro

Sistema completo de gestión para ministerios de alabanza y adoración.

## ✨ Características
=======
# Praise Planner Pro

Aplicación de planificación para ministerios de alabanza construida con React, TypeScript, Vite y Supabase.

## 🚀 Despliegue en Easypanel

Este proyecto está configurado para desplegarse en Easypanel usando Docker.

### Variables de Entorno Requeridas

En Easypanel, debes configurar las siguientes variables de entorno como **Build Arguments**:

- `VITE_SUPABASE_URL`: La URL de tu proyecto Supabase (ej: `https://tu-proyecto.supabase.co` o `http://tu-supabase-url:8000` si es self-hosted)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: La clave pública (anon key) de tu proyecto Supabase

**Nota:** Si estás usando Supabase self-hosted con tu base de datos PostgreSQL, necesitas:
1. La URL de Supabase API (no la URL de PostgreSQL directamente)
2. La clave anon/public key de Supabase

Si tienes PostgreSQL directamente y quieres usar Supabase self-hosted, necesitas configurar Supabase para que use tu base de datos PostgreSQL como backend.

### Configuración en Easypanel

1. Crea un nuevo servicio en Easypanel
2. Selecciona "Git" como fuente
3. Conecta el repositorio: `https://github.com/daveymena/praise-planner-pro.git`
4. En la sección de Build Arguments, agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = tu clave pública de Supabase
5. El puerto debe ser `80` (ya configurado en el Dockerfile)
6. Easypanel detectará automáticamente el Dockerfile

### Estructura del Proyecto

El proyecto incluye:
- `Dockerfile`: Configuración multi-stage para producción
- `nginx.conf`: Configuración de Nginx para servir la aplicación
- `.dockerignore`: Archivos excluidos del build de Docker
>>>>>>> 547bf4b29666d8a4068b92295cae21fc2f742582

- 👥 **Gestión de Miembros**: Administra integrantes, roles, instrumentos y contactos
- 🎵 **Repertorio Musical**: Organiza canciones por tipo, tonalidad y favoritas
- 📅 **Planificación de Ensayos**: Programa ensayos con asistencia y canciones
- ⛪ **Servicios**: Planifica servicios dominicales y especiales
- 📋 **Reglas del Ministerio**: Mantén las normas y procedimientos organizados

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# Ejecuta este archivo para iniciar todo automáticamente
run-local-sqlite.bat
```

### Opción 2: Manual
```bash
# 1. Instalar dependencias
npm install
cd server && npm install && cd ..

# 2. Iniciar backend (SQLite)
cd server
node server-sqlite.js

# 3. Iniciar frontend (nueva terminal)
npm run dev

# 4. Probar API (nueva terminal)
node test-api.js
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3002
- **Health Check**: http://localhost:3002/health

## 🗄️ Base de Datos

### Desarrollo Local (SQLite)
- Base de datos: `server/database.sqlite` (se crea automáticamente)
- Datos de ejemplo incluidos: 5 miembros, 8 canciones, 3 ensayos

### Producción (PostgreSQL en EasyPanel)
- Archivos SQL listos en `server/migrations/`
- Configuración en `server/.env.production`
- Guía completa en `EASYPANEL_SETUP.md`

## 📁 Estructura del Proyecto

```
praise-planner-pro/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes UI
│   ├── hooks/             # React Query hooks
│   ├── pages/             # Páginas principales
│   ├── lib/               # API client
│   └── types/             # Tipos TypeScript
├── server/                # Backend Node.js + Express
│   ├── config/            # Configuración de BD
│   ├── routes/            # Rutas API
│   ├── migrations/        # Scripts SQL
│   └── server-sqlite.js   # Servidor SQLite
├── run-local-sqlite.bat   # Script de inicio automático
├── test-api.js           # Script de pruebas API
└── EASYPANEL_SETUP.md    # Guía de despliegue
```

## 🔧 API Endpoints

### Miembros
- `GET /api/members` - Lista todos los miembros
- `POST /api/members` - Crear nuevo miembro
- `PUT /api/members/:id` - Actualizar miembro
- `DELETE /api/members/:id` - Eliminar miembro

### Canciones
- `GET /api/songs` - Lista canciones (con filtros)
- `POST /api/songs` - Crear nueva canción
- `PATCH /api/songs/:id/favorite` - Marcar/desmarcar favorita
- `DELETE /api/songs/:id` - Eliminar canción

### Ensayos
- `GET /api/rehearsals` - Lista todos los ensayos
- `GET /api/rehearsals/upcoming` - Próximos ensayos
- `POST /api/rehearsals` - Crear nuevo ensayo

### Servicios
- `GET /api/services` - Lista servicios
- `GET /api/services/upcoming` - Próximos servicios
- `POST /api/services` - Crear nuevo servicio

### Reglas del Ministerio
- `GET /api/rules` - Lista reglas por categoría
- `POST /api/rules` - Crear nueva regla
- `DELETE /api/rules/:id` - Eliminar regla

## 🧪 Pruebas

```bash
# Probar todos los endpoints
node test-api.js

# Verificar salud del servidor
curl http://localhost:3002/health
```

## 🚀 Despliegue en EasyPanel

1. **Preparar PostgreSQL**:
   - Ejecutar `server/migrations/001_create_tables.sql`
   - Ejecutar `server/migrations/002_seed_data.sql`

2. **Configurar Backend**:
   - Usar variables de `server/.env.production`
   - Host interno: `ollama_postgres-db:5432`

3. **Desplegar Frontend**:
   - `npm run build`
   - Subir carpeta `dist/`

Ver guía completa en `EASYPANEL_SETUP.md`

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (estado del servidor)
- Radix UI + Tailwind CSS (componentes)
- React Hook Form + Zod (formularios)

### Backend
- Node.js + Express
- SQLite (desarrollo) / PostgreSQL (producción)
- CORS configurado
- Rate limiting
- Helmet (seguridad)

## 📝 Estado del Proyecto

✅ **COMPLETAMENTE FUNCIONAL**

- ✅ Backend API completo y probado
- ✅ Frontend conectado y funcionando
- ✅ Base de datos con datos de ejemplo
- ✅ Scripts de automatización
- ✅ Listo para despliegue en EasyPanel

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**🎵 ¡Que la alabanza nunca pare!** 🙌