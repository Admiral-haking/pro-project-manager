import { ipcMain } from "electron";
import { getMongooseConnection } from "@electron/backend/connection";
import Server from "@electron/backend/legacy/server";

async function ensureConnection() {
    await getMongooseConnection();
}

export function registerServerIpcHandlers() {
    if (ipcMain.listenerCount("servers:list") > 0) return;

    ipcMain.handle("servers:list", async () => {
        await ensureConnection();
        const docs = await Server.find().sort({ updatedAt: -1 }).lean();
        return docs.map((s) => ({
            id: s._id?.toString(),
            title: s.title,
            host: s.host,
            port: s.port,
            users: s.users ?? [],
            updatedAt: s.updatedAt,
            createdAt: s.createdAt
        }));
    });

    ipcMain.handle("servers:get", async (_event, id: string) => {
        await ensureConnection();
        const doc = await Server.findById(id).lean();
        if (!doc) return null;
        return {
            id: doc._id?.toString(),
            title: doc.title,
            host: doc.host,
            port: doc.port,
            users: doc.users ?? [],
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt
        };
    });

    ipcMain.handle("servers:save", async (_event, payload: { id?: string; title: string; host: string; port?: string; users?: any[] }) => {
        await ensureConnection();
        const title = (payload.title ?? "").trim();
        const host = (payload.host ?? "").trim();
        const port = (payload.port ?? "22").trim();
        if (!title) throw new Error("Title is required");
        if (!host) throw new Error("Host is required");

        const data = {
            title,
            host,
            port: port || "22",
            users: payload.users ?? []
        };

        const doc = payload.id
            ? await Server.findByIdAndUpdate(payload.id, data, { new: true, upsert: false }).lean()
            : await Server.create(data).then((d) => d.toObject());

        return {
            id: doc._id?.toString(),
            title: doc.title,
            host: doc.host,
            port: doc.port,
            users: doc.users ?? [],
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt
        };
    });
}
