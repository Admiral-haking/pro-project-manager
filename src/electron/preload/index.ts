import { contextBridge, ipcRenderer } from 'electron';
import type { SessionsManager } from '@electron/backend/session';

type LocalSessionOptions = Parameters<SessionsManager["createLocal"]>[0];
type SshSessionOptions = Parameters<SessionsManager["createSsh"]>[0];

contextBridge.exposeInMainWorld('electron', {
    config: {
        getMongoUri: () => ipcRenderer.invoke('config:get-mongo-uri'),
        setMongoUri: (uri: string) => ipcRenderer.invoke('config:set-mongo-uri', uri),
    },
    projects: {
        list: (payload?: { categoryId?: string }) => ipcRenderer.invoke('projects:list', payload),
        get: (id: string) => ipcRenderer.invoke('projects:get', id),
        save: (payload: { id?: string; title: string; priority?: number; description?: string; categoryIds?: string[] }) => ipcRenderer.invoke('projects:save', payload),
        delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
    },
    servers: {
        list: () => ipcRenderer.invoke('servers:list'),
        get: (id: string) => ipcRenderer.invoke('servers:get', id),
        save: (payload: { id?: string; title: string; host: string; port?: string; users?: any[] }) => ipcRenderer.invoke('servers:save', payload),
    },
    categories: {
        list: () => ipcRenderer.invoke('categories:list'),
        create: (title: string) => ipcRenderer.invoke('categories:create', title),
    },
    sessions: {
        createLocal: (opts: LocalSessionOptions) => ipcRenderer.invoke('session:create-local', opts),
        createSsh: (opts: SshSessionOptions) => ipcRenderer.invoke('session:create-ssh', opts),
        list: () => ipcRenderer.invoke('session:list'),
        write: (id: string, data: string) => ipcRenderer.invoke('session:write', { id, data }),
        resize: (id: string, cols: number, rows: number) => ipcRenderer.invoke('session:resize', { id, cols, rows }),
        sendCommand: (id: string, cmd: string) => ipcRenderer.invoke('session:send-command', { id, cmd }),
        getHistory: (id: string) => ipcRenderer.invoke('session:get-history', id),
        close: (id: string) => ipcRenderer.invoke('session:close', id),
        onData: (cb: (payload: { id: string; data: string }) => void) => {
            const listener = (_event: Electron.IpcRendererEvent, payload: { id: string; data: string }) => cb(payload);
            ipcRenderer.on('session:data', listener);
            return () => ipcRenderer.removeListener('session:data', listener);
        },
    },
    window: {
        close: () => ipcRenderer.invoke('window:close'),
        minimize: () => ipcRenderer.invoke('window:minimize'),
        maximize: () => ipcRenderer.invoke('window:maximize'),
    },
    newTerminal: (id: string) => ipcRenderer.invoke("new-terminal", id)
});
