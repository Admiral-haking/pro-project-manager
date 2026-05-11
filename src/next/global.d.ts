import type { ReactNode } from "react";
import type { HistoryEntry, SessionType, SessionsManager } from "@electron/backend/session";
export { };

declare global {

  type LocalSessionOptions = Parameters<SessionsManager["createLocal"]>[0];
  type SshSessionOptions = Parameters<SessionsManager["createSsh"]>[0];

  interface Window {
    electron?: {
      config?: {
        getMongoUri?: () => Promise<{ mongoUri: string }>;
        setMongoUri?: (uri: string) => Promise<{ ok: boolean; mongoUri: string }>;
      };
      servers?: {
        list?: () => Promise<any>;
        get?: (id: string) => Promise<any>;
        save?: (payload: { id?: string; title: string; host: string; port?: string; users?: any[] }) => Promise<any>;
      };
      projects?: {
        list?: (payload?: { categoryId?: string }) => Promise<any>;
        get?: (id: string) => Promise<any>;
        save?: (payload: { id?: string; title: string; priority?: number; description?: string; categoryIds?: string[] }) => Promise<any>;
        delete?: (id: string) => Promise<{ ok: boolean }>;
      };
      categories?: {
        list?: () => Promise<Array<{ id: string; title: string }>>;
        create?: (title: string) => Promise<{ id: string; title: string }>;
      };
      sessions?: {
        createLocal?: (opts: LocalSessionOptions) => Promise<{ id: string; name: string; type: SessionType }>;
        createSsh?: (opts: SshSessionOptions) => Promise<{ id: string; name: string; type: SessionType }>;
        list?: () => Promise<Array<{ id: string; name: string; type: SessionType }>>;
        write?: (id: string, data: string) => Promise<void>;
        resize?: (id: string, cols: number, rows: number) => Promise<void>;
        sendCommand?: (id: string, cmd: string) => Promise<HistoryEntry>;
        getHistory?: (id: string) => Promise<HistoryEntry[]>;
        close?: (id: string) => Promise<void>;
        onData?: (cb: (payload: { id: string; data: string }) => void) => () => void;
      };
      window?: {
        close?: () => Promise<void>;
        minimize?: () => Promise<void>;
        maximize?: () => Promise<void>;
      };
      newTerminal: (id: string) => any
    }
  }

  type ChildProp = { children: ReactNode }
}
