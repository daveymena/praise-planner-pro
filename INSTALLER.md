# Alabanza Planner Pro - Instalador

## 📦 Cómo Crear el Instalador

### Requisitos Previos
- Node.js 18+ instalado
- Todas las dependencias instaladas (`npm install`)

### Pasos para Generar el Instalador

#### 1. Instalar Dependencias de Electron
```bash
npm install --save-dev electron electron-builder wait-on
```

#### 2. Construir la Aplicación
```bash
# Construir frontend
npm run build

# Construir instalador para Windows
npm run electron:build:win
```

### Tipos de Instaladores Generados

El comando anterior generará 2 archivos en la carpeta `dist-electron`:

1. **`Alabanza Planner Pro-Setup-1.0.0.exe`** 
   - Instalador completo con asistente
   - Permite elegir carpeta de instalación
   - Crea accesos directos en escritorio y menú inicio
   - Recomendado para distribución

2. **`Alabanza Planner Pro-Portable-1.0.0.exe`**
   - Versión portable (no requiere instalación)
   - Se puede ejecutar desde USB
   - Ideal para pruebas rápidas

### Comandos Disponibles

```bash
# Modo desarrollo (con recarga en caliente)
npm run electron:dev

# Construir solo para Windows
npm run electron:build:win

# Construir solo para Mac
npm run electron:build:mac

# Construir solo para Linux
npm run electron:build:linux

# Construir para todas las plataformas
npm run electron:build
```

### Personalización

Para personalizar el instalador, edita `electron-package.json`:

- **Icono**: Coloca tu icono en `build/icon.ico` (Windows) o `build/icon.png` (Linux)
- **Nombre**: Cambia `productName` en la configuración
- **Versión**: Actualiza el campo `version`

### Estructura de Archivos

```
praise-planner-pro/
├── electron/
│   └── main.js          # Proceso principal de Electron
├── build/
│   ├── icon.ico         # Icono para Windows
│   ├── icon.icns        # Icono para Mac
│   └── icon.png         # Icono para Linux
├── dist/                # Build del frontend (generado)
├── dist-electron/       # Instaladores (generado)
└── electron-package.json # Configuración de Electron
```

### Notas Importantes

1. **Base de Datos**: La app usa SQLite, que se creará automáticamente en:
   - Windows: `%APPDATA%/Alabanza Planner Pro/database.db`
   - Mac: `~/Library/Application Support/Alabanza Planner Pro/database.db`
   - Linux: `~/.config/Alabanza Planner Pro/database.db`

2. **Puerto del Servidor**: El backend corre en el puerto 3003 internamente

3. **Actualizaciones**: Para actualizar, simplemente instala la nueva versión sobre la anterior

### Solución de Problemas

**Error: "Cannot find module 'electron'"**
```bash
npm install --save-dev electron
```

**Error de permisos en Windows**
```bash
# Ejecutar PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**El instalador no se genera**
```bash
# Limpiar caché y reconstruir
rm -rf dist dist-electron node_modules
npm install
npm run build
npm run electron:build:win
```
