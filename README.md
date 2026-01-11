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

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
