import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const CONFIG_FILENAME = "db-config.json";
const CHANNEL_SET = "config:set-mongo-uri";
const CHANNEL_GET = "config:get-mongo-uri";

type Waiter = (uri: string) => void;
const waiters = new Set<Waiter>();

function notifyWaiters(uri: string) {
    waiters.forEach((fn) => fn(uri));
    waiters.clear();
}

export function validateMongoUri(uri: string): string {
    const trimmed = (uri ?? "").trim();
    if (!trimmed) throw new Error("Connection string is required");
    if (!/^mongodb(\+srv)?:\/\//i.test(trimmed)) {
        throw new Error("Must start with mongodb:// or mongodb+srv://");
    }
    return trimmed;
}

function getConfigPath() {
    return path.join(app.getPath("userData"), CONFIG_FILENAME);
}

async function loadConfigFile(): Promise<{ mongoUri?: string } | null> {
    try {
        const raw = await readFile(getConfigPath(), "utf-8");
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function loadStoredMongoUri(): Promise<string | null> {
    const config = await loadConfigFile();
    const uri = config?.mongoUri?.trim();
    return uri && uri.length ? uri : null;
}

export async function persistMongoUri(uri: string): Promise<void> {
    const payload = { mongoUri: uri.trim() };
    await writeFile(getConfigPath(), JSON.stringify(payload, null, 2), "utf-8");
    process.env.MONGODB_URI = uri.trim();
}

export function registerMongoIpcHandlers() {
    if (ipcMain.listenerCount(CHANNEL_SET) > 0) return; // already registered

    ipcMain.handle(CHANNEL_GET, async () => {
        const envUri = process.env.MONGODB_URI?.trim();
        const stored = await loadStoredMongoUri();
        return { mongoUri: envUri || stored || "" };
    });

    ipcMain.handle(CHANNEL_SET, async (_event, uri: string) => {
        const normalized = validateMongoUri(uri);
        await persistMongoUri(normalized);
        notifyWaiters(normalized);
        return { ok: true, mongoUri: normalized };
    });
}

export async function ensureMongoUri(createWindow: () => BrowserWindow): Promise<string> {
    const envUri = process.env.MONGODB_URI?.trim();
    if (envUri) {
        await persistMongoUri(envUri);
        return envUri;
    }

    const stored = await loadStoredMongoUri();
    if (stored) {
        process.env.MONGODB_URI = stored;
        return stored;
    }

    const cfgWindow = createWindow();
    let configured = false;

    return new Promise<string>((resolve, reject) => {
        const onSet: Waiter = (uri: string) => {
            configured = true;
            cleanup();
            if (!cfgWindow.isDestroyed()) cfgWindow.close();
            resolve(uri);
            console.log(uri);

        };

        const cleanup = () => {
            waiters.delete(onSet);
            cfgWindow.removeListener("closed", onClosed);
        };

        const onClosed = async () => {
            cleanup();
            if (configured) return;

            // If a URI was persisted before the window closed, accept it.
            const latest = (await loadStoredMongoUri()) || process.env.MONGODB_URI?.trim();
            if (latest) {
                resolve(latest);
                return;
            }

            await dialog.showMessageBox({
                type: "error",
                title: "MongoDB Connection Required",
                message: "A MongoDB connection string is required to start the app.",
                buttons: ["Quit"]
            });
            app.quit();
            reject(new Error("MongoDB connection string not provided"));
        };

        waiters.add(onSet);
        cfgWindow.on("closed", onClosed);
    });
}
