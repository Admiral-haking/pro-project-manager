import path from "node:path";
import fs from "node:fs";
import { app } from "electron";

export const isDev = !app.isPackaged;

export function getRendererUrl(route: string): string {
    const trimmed = route.startsWith("/") ? route.slice(1) : route;
    if (isDev) {
        return `http://localhost:4152/${trimmed}`;
    }
    const file = trimmed.length ? `${trimmed}/index.html` : "index.html";
    return `app://-/${file}`;
}

export function getPreloadPath() {
    // In dev, dist lives at projectRoot/dist. In production, app.getAppPath() points inside app.asar.
    const appPath = app.getAppPath();
    const devOrAsarPath = path.join(appPath, "dist", "preload.cjs");
    if (fs.existsSync(devOrAsarPath)) return devOrAsarPath;

    // Fallback if Electron unpacks extraResources
    const unpacked = path.join(process.resourcesPath, "app.asar.unpacked", "dist", "preload.cjs");
    return unpacked;
}
