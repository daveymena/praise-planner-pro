const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Configuración del servidor backend
const startBackendServer = () => {
    const isDev = !app.isPackaged;

    if (isDev) {
        // En desarrollo, el servidor ya está corriendo con npm run dev:full
        console.log('🔧 Modo desarrollo: usando servidor existente');
        return;
    }

    // En producción, iniciar el servidor empaquetado
    const serverPath = path.join(process.resourcesPath, 'server', 'server.js');
    const nodePath = process.execPath.replace('Alabanza Planner Pro.exe', 'node.exe');

    console.log('🚀 Iniciando servidor backend...');
    serverProcess = spawn(nodePath, [serverPath], {
        cwd: path.join(process.resourcesPath, 'server'),
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: '3003'
        }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`[Server] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data}`);
    });
};

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../build/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        backgroundColor: '#1a1a2e',
        show: false,
        autoHideMenuBar: true
    });

    // Cargar la aplicación
    const isDev = !app.isPackaged;
    const startUrl = isDev
        ? 'http://localhost:8080'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Mostrar cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Crear menú personalizado
    const template = [
        {
            label: 'Archivo',
            submenu: [
                {
                    label: 'Recargar',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow.reload()
                },
                { type: 'separator' },
                {
                    label: 'Salir',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Seleccionar todo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { label: 'Pantalla completa', role: 'togglefullscreen' },
                { type: 'separator' },
                { label: 'Acercar', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Alejar', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: 'Tamaño real', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' }
            ]
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: 'Acerca de Alabanza Planner Pro',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Acerca de',
                            message: 'Alabanza Planner Pro v1.0.0',
                            detail: 'Sistema de Gestión Ministerial para Ministerios de Alabanza\n\n© 2026 Ministerio de Alabanza'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// Inicialización de la app
app.whenReady().then(() => {
    startBackendServer();

    // Esperar un poco para que el servidor inicie
    setTimeout(createWindow, 2000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});
