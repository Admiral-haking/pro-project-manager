import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import { createMainWindow } from './windows/mainWindow';
import { createMongoConfigWindow } from './windows/mongoConfigWindow';
import { TracyRender } from './tray';
import { ensureMongoUri, registerMongoIpcHandlers } from './config/mongoUri';
import { join } from 'path';
import { SessionsManager } from '@electron/backend/session';
import type { SessionPublic } from '@electron/backend/session';
import { createTerminalWindow } from './windows/terminalWindow';
import { registerProjectIpcHandlers } from './ipc/projects';
import { registerServerIpcHandlers } from './ipc/servers';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

const SESSION_DATA_CHANNEL = "session:data";

function registerWindowControlHandlers() {
  if (ipcMain.listenerCount("window:close") > 0) return;

  const getWindow = (event: Electron.IpcMainInvokeEvent) => BrowserWindow.fromWebContents(event.sender);

  ipcMain.handle("window:close", (event) => {
    const win = getWindow(event);
    win?.close();
  });

  ipcMain.handle("window:minimize", (event) => {
    const win = getWindow(event);
    win?.minimize();
  });

  ipcMain.handle("window:maximize", (event) => {
    const win = getWindow(event);
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
}

function registerSessionIpcHandlers(manager: SessionsManager) {
  if (ipcMain.listenerCount("session:create-local") > 0) return;

  const dataSubscriptions = new Map<string, Set<() => void>>();

  const trackSubscription = (sessionId: string, dispose: () => void) => {
    const set = dataSubscriptions.get(sessionId) ?? new Set();
    set.add(dispose);
    dataSubscriptions.set(sessionId, set);
  };

  const cleanupSubscriptions = (sessionId: string) => {
    const set = dataSubscriptions.get(sessionId);
    if (!set) return;
    for (const dispose of set) {
      try {
        dispose();
      } catch {
        // ignore
      }
    }
    dataSubscriptions.delete(sessionId);
  };

  const forwardData = (session: SessionPublic) => {
    const dispose = session.onData((chunk) => {
      for (const win of BrowserWindow.getAllWindows()) {
        if (win.isDestroyed()) continue;
        win.webContents.send(SESSION_DATA_CHANNEL, { id: session.id, data: chunk });
      }
    });

    trackSubscription(session.id, dispose);
  };

  const requireSession = (id: string) => {
    const session = manager.get(id);
    if (!session) throw new Error(`Session not found: ${id}`);
    return session;
  };

  ipcMain.handle("session:create-local", (event, opts: Parameters<SessionsManager["createLocal"]>[0]) => {
    const session = manager.createLocal(opts);
    forwardData(session);
    return { id: session.id, name: session.name, type: session.type };
  });

  ipcMain.handle("session:create-ssh", (event, opts: Parameters<SessionsManager["createSsh"]>[0]) => {
    const session = manager.createSsh(opts);
    forwardData(session);
    return { id: session.id, name: session.name, type: session.type };
  });

  ipcMain.handle("session:list", () => manager.list());

  ipcMain.handle("session:write", (_event, payload: { id: string; data: string }) => {
    const session = requireSession(payload.id);
    session.write(payload.data);
  });

  ipcMain.handle("session:resize", (_event, payload: { id: string; cols: number; rows: number }) => {
    const session = requireSession(payload.id);
    session.resize(payload.cols, payload.rows);
  });

  ipcMain.handle("session:send-command", async (_event, payload: { id: string; cmd: string }) => {
    const session = requireSession(payload.id);
    return session.sendCommand(payload.cmd);
  });

  ipcMain.handle("session:get-history", (_event, sessionId: string) => {
    const session = requireSession(sessionId);
    return session.getHistory();
  });

  ipcMain.handle("session:close", (_event, sessionId: string) => {
    cleanupSubscriptions(sessionId);
    manager.close(sessionId);
  });

  ipcMain.handle("new-terminal", (_, sessionId: string) => {
    createTerminalWindow(sessionId)
  })
}

const mgr = new SessionsManager();
registerSessionIpcHandlers(mgr);
registerWindowControlHandlers();


const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit(); // Quit if another instance is already running
}

let awaitingMongoConfig = true;

app.on('window-all-closed', () => {
  if (awaitingMongoConfig) return;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.whenReady().then(async () => {
  registerMongoIpcHandlers();
  registerProjectIpcHandlers();
  registerServerIpcHandlers();
  await ensureMongoUri(() => createMongoConfigWindow());
  awaitingMongoConfig = false;
  createMainWindow();
  TracyRender();
});


app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    try {
      const target = new URL(url);
      if (target.pathname === "/terminal") {
        const id = target.searchParams.get("id") ?? "";
        createTerminalWindow(id);
        return { action: "deny" };
      }
    } catch {
      // fall through to default handler
    }

    // Create your own BrowserWindow instead of the default
    const child = new BrowserWindow({
      width: 600,
      height: 600,
      autoHideMenuBar: true, // hides menu bar
      icon: join(__dirname, '../assets/hippogriff.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    child.setMenu(null);
    child.loadURL(url);
    return { action: "deny" };
  });
});



process.on("uncaughtException", console.log)
process.on("uncaughtExceptionMonitor", console.log)
process.on("unhandledRejection", console.log)
