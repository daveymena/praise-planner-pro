# Configuración para EasyPanel

## 📋 Pasos para configurar Praise Planner Pro en EasyPanel

### 1. Configurar PostgreSQL

1. **Accede a tu PostgreSQL en EasyPanel**
   - Ve a tu panel de EasyPanel
   - Busca tu servicio PostgreSQL
   - Accede al cliente SQL o terminal

2. **Ejecutar las migraciones**
   ```sql
   -- Paso 1: Crear las tablas
   -- Copia y pega todo el contenido de: server/migrations/001_create_tables.sql
   
   -- Paso 2 (OPCIONAL): Insertar datos de ejemplo
   -- SI QUIERES UNA BASE DE DATOS LIMPIA, NO EJECUTES ESTE PASO.
   -- Copia y pega todo el contenido de: server/migrations/002_seed_data.sql
   ```

### 2. Configurar Variables de Entorno

Cuando despliegues la aplicación en EasyPanel, usa estas variables de entorno:

```env
# Database Configuration (EasyPanel PostgreSQL - Production)
DB_HOST=ollama_postgres-db
DB_PORT=5432
DB_NAME=alabanza
DB_USER=postgres
DB_PASSWORD=6715320Dvd.

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret (cambia por uno seguro)
JWT_SECRET=praise-planner-pro-super-secret-jwt-key-2025

# CORS Origin (tu dominio de frontend)
CORS_ORIGIN=https://tu-dominio.com
```

### 3. Estructura de Despliegue

```
EasyPanel Services:
├── PostgreSQL Database (ollama_postgres-db)
├── Backend API (Node.js/Express) - Puerto 3001
└── Frontend (React/Vite) - Puerto 80/443
```

### 4. Comandos de Despliegue

**Backend:**
```bash
# Instalar dependencias
cd server && npm install

# Ejecutar migraciones (si tienes acceso a terminal)
npm run migrate

# Iniciar servidor
npm start
```

**Frontend:**
```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build

# Los archivos estáticos estarán en dist/
```

### 5. Verificación

Una vez desplegado, verifica:

1. **Backend Health Check:**
   ```
   GET https://tu-api-domain.com/health
   ```

2. **Database Connection:**
   ```
   GET https://tu-api-domain.com/api/members
   ```

3. **Frontend:**
   - Accede a tu dominio frontend
   - Verifica que carguen los datos

### 6. Configuración de Red

En EasyPanel, asegúrate de que:
- El backend puede conectarse a PostgreSQL usando `ollama_postgres-db:5432`
- El frontend puede hacer requests al backend
- Los puertos están correctamente expuestos

### 7. Archivos Importantes

- `server/.env.production` - Variables de entorno para producción
- `server/migrations/001_create_tables.sql` - Schema de base de datos
- `server/migrations/002_seed_data.sql` - Datos de ejemplo (NO USAR PARA PROD)
- `server/server.js` - Servidor principal

### 8. Troubleshooting

**Si la conexión a PostgreSQL falla:**
1. Verifica que el nombre del servicio sea correcto (`ollama_postgres-db`)
2. Confirma que el puerto sea 5432 (interno)
3. Revisa los logs de PostgreSQL en EasyPanel

**Si el frontend no conecta al backend:**
1. Verifica la variable `CORS_ORIGIN`
2. Confirma que las URLs del API sean correctas
3. Revisa los logs del backend

### 9. Próximos Pasos

Una vez funcionando:
1. Cambiar el JWT_SECRET por uno más seguro
2. Configurar HTTPS
3. Configurar backups de la base de datos
4. Configurar monitoreo y logs