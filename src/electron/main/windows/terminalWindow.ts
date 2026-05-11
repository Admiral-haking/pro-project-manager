import { BrowserWindow, screen } from "electron";
import path from 'node:path';
import { getPreloadPath, getRendererUrl, isDev } from "../utils/renderer";

export const createTerminalWindow = (id: string) => {
    const position = screen.getPrimaryDisplay();
    const mainWindow = new BrowserWindow({
        ...position,
        width: 800,
        height: 400,
        minWidth: 400,
        minHeight: 300,
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
            mainWindow.loadURL(getRendererUrl(`/terminal?id=${id}`));
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        } else {
            mainWindow.loadURL(getRendererUrl(`/terminal?id=${id}`));
        }
    })();

    mainWindow.setMenu(null)

    return mainWindow
};
