import { BrowserWindow, screen } from "electron";
import path from 'node:path';
import { getPreloadPath, getRendererUrl, isDev } from "../utils/renderer";

export const createMainWindow = () => {
    const position = screen.getPrimaryDisplay();
    const mainWindow = new BrowserWindow({
        ...position,
        width: 1300,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        show: false,
        transparent: true,
        frame: false,
        icon: path.join(__dirname, '../assets/icon.png'),
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,          // 👈 important
            webSecurity: false,      // 👈 allows access to .path

        },
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    (async () => {
        if (isDev) {
            mainWindow.loadURL(getRendererUrl("/"));
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        } else {
            mainWindow.loadURL(getRendererUrl("/"));
        }
    })();

    mainWindow.setMenu(null)

    return mainWindow
};
