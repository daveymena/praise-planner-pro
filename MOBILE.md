# 📱 Alabanza Planner Pro - Guía para App Móvil

Esta guía te ayudará a convertir tu aplicación web en una **App Nativa para Android y iOS** utilizando **Capacitor**.

## 🚀 Requisitos Previos

- **Node.js**: Instalado en tu computadora.
- **Android Studio**: Para generar la versión de Android.
- **Xcode**: Solo si estás en una Mac y quieres la versión de iOS.

## 🛠️ Pasos para generar la App

### 1. Instalar Capacitor
Ejecuta estos comandos en la carpeta raíz del proyecto:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```
*(Ya hemos creado el archivo `capacitor.config.ts` por ti)*.

### 2. Agregar Plataformas
```bash
# Instalar los paquetes de plataformas
npm install @capacitor/android @capacitor/ios

# Crear las carpetas nativas
npx cap add android
npx cap add ios
```

### 3. Generar el Build y Sincronizar
Cada vez que hagas cambios en la web y quieras verlos en el celular, haz lo siguiente:
```bash
# 1. Crear el build de producción de la web
npm run build

# 2. Copiar los archivos a las carpetas del celular
npx cap copy
```

### 4. Abrir en Herramientas de Desarrollo
Para compilar el archivo final (APK o App):
```bash
# Abrir en Android Studio
npx cap open android

# Abrir en Xcode (Solo Mac)
npx cap open ios
```

---

## ✨ Optimizaciones Móviles Implementadas

Hemos ajustado la aplicación para que se sienta **premium y compacta**:

1.  **Vista de Canción "Compacta"**:
    - El video de YouTube ahora aparece arriba en celulares para no ocupar espacio lateral.
    - Tipografía limpia y moderna (sin cursivas gigantes) para máxima legibilidad.
    - Botones de acción optimizados para el pulgar.
2.  **Letras Profesionales**:
    - Las estrofas y coros están separados por espacios claros, tal como en el orden de la imagen que enviaste.
    - Se eliminó el "ruido" visual y los acordes mezclados en la letra para que sea legible durante el ensayo.
3.  **Formularios Inteligentes**:
    - El buscador de IA ahora es más compacto en móvil.
    - Los campos de entrada se agrupan mejor para evitar el "scroll" infinito.
4.  **Video en App**:
    - Integración total del reproductor de YouTube dentro de la app móvil.

## 📦 Generación del APK (Android)
1. En Android Studio, ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Una vez termine, aparecerá una notificación para abrir la carpeta con tu archivo `.apk`.

---

¡Disfruta de tu ministerio con una herramienta profesional en la palma de tu mano! 🎵🙌
