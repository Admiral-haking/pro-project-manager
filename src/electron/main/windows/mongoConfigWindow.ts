import { BrowserWindow } from "electron";
import { getPreloadPath, getRendererUrl, isDev } from "../utils/renderer";

export function createMongoConfigWindow() {
    const win = new BrowserWindow({
        width: 620,
        height: 420,
        resizable: false,
        autoHideMenuBar: true,
        show: false,
        transparent: false,
        frame: true,
        title: "MongoDB Connection",
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: isDev ? false : true
        }
    });

    win.once("ready-to-show", () => win.show());

    const url = isDev
        ? getRendererUrl("/mongo-uri")
        : getRendererUrl("mongo-uri");

    win.loadURL(url);

    return win;
}
