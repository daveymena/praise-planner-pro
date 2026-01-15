# 🎵 Praise Planner Pro

Sistema completo de gestión para ministerios de alabanza y adoración.

Aplicación de planificación para ministerios de alabanza construida con React, TypeScript, Vite y PostgreSQL.

## 🚀 Despliegue en Easypanel

Este proyecto está configurado para desplegarse en Easypanel usando Docker.

### Variables de Entorno Requeridas

En Easypanel, debes configurar las siguientes variables de entorno:

- `DB_HOST`: Host de la base de datos PostgreSQL
- `DB_USER`: Usuario de la base de datos
- `DB_PASS`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `JWT_SECRET`: Secreto para tokens JWT

### Configuración en Easypanel

1. Crea un nuevo servicio en Easypanel
2. Selecciona "Git" como fuente
3. Conecta el repositorio: `https://github.com/daveymena/praise-planner-pro.git`
4. El puerto de exposición debe ser `3001` (ya configurado en el Dockerfile)
5. Easypanel detectará automáticamente el Dockerfile

## ✨ Características

- 👥 **Gestión de Miembros**: Administra integrantes, roles, instrumentos y contactos
- 🎵 **Repertorio Musical**: Organiza canciones por tipo, tonalidad y favoritas
- 📅 **Planificación de Ensayos**: Programa ensayos con asistencia y canciones
- ⛪ **Servicios**: Planifica servicios dominicales y especiales
- 📋 **Reglas del Ministerio**: Mantén las normas y procedimientos organizados
- 🤖 **Buscador Inteligente**: Importa canciones y acordes automáticamente vía IA

## 🚀 Inicio Rápido (Local)

### Requisitos
- Node.js 20+
- PostgreSQL (opcional, usa SQLite por defecto en local)

### Pasos
```bash
# 1. Instalar dependencias raíz
npm install

# 2. Instalar dependencias del servidor
cd server && npm install && cd ..

# 3. Iniciar todo en modo desarrollo
npm run dev:full
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3003
- **Health Check**: http://localhost:3003/health

## 🗄️ Base de Datos

### Desarrollo Local (SQLite)
- Se configura automáticamente al iniciar el servidor local.

### Producción (PostgreSQL en EasyPanel)
- El sistema ejecuta migraciones automáticas al iniciar.

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (estado del servidor)
- Radix UI + Tailwind CSS (componentes)

### Backend
- Node.js + Express
- PostgreSQL
- JWT para Autenticación

---

**🎵 ¡Que la alabanza nunca pare!** 🙌