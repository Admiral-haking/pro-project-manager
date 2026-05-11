import { ipcMain } from "electron";
import { Types } from "mongoose";
import { getMongooseConnection } from "@electron/backend/connection";
import Project from "@electron/backend/legacy/project";
import Category from "@electron/backend/legacy/category";

type LeanProject = Awaited<ReturnType<typeof normalizeProject>>;

async function normalizeProject(project: any) {
    return {
        id: project._id?.toString(),
        title: project.title,
        priority: project.priority ?? 0,
        description: project.description ?? "",
        categoryIds: (project.categoryIds ?? []).map((c: any) => c._id?.toString?.() ?? c?.toString?.()).filter(Boolean),
        categories: (project.categoryIds ?? []).map((c: any) => ({ id: c._id?.toString?.(), title: c.title })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    };
}

async function ensureConnection() {
    await getMongooseConnection();
}

export function registerProjectIpcHandlers() {
    if (ipcMain.listenerCount("projects:list") > 0) return; // already registered

    ipcMain.handle("projects:list", async (_event, payload?: { categoryId?: string }) => {
        await ensureConnection();
        const query: Record<string, any> = {};
        if (payload?.categoryId) {
            query.categoryIds = new Types.ObjectId(payload.categoryId);
        }

        const docs = await Project.find(query)
            .populate("categoryIds")
            .sort({ updatedAt: -1 })
            .lean();
        return Promise.all(docs.map(normalizeProject));
    });

    ipcMain.handle("projects:get", async (_event, id: string) => {
        await ensureConnection();
        const doc = await Project.findById(id).populate("categoryIds").lean();
        if (!doc) return null;
        return normalizeProject(doc);
    });

    ipcMain.handle("projects:save", async (_event, payload: { id?: string; title: string; priority?: number; description?: string; categoryIds?: string[] }) => {
        await ensureConnection();
        const title = (payload.title ?? "").trim();
        if (!title) throw new Error("Title is required");

        const categoryIds = (payload.categoryIds ?? [])
            .filter(Boolean)
            .map((id) => new Types.ObjectId(id));

        const data: any = {
            title,
            priority: payload.priority ?? 0,
            description: payload.description ?? "",
            categoryIds,
        };

        const doc = payload.id
            ? await Project.findByIdAndUpdate(payload.id, data, { new: true }).populate("categoryIds")
            : await Project.create(data).then((p) => p.populate("categoryIds"));

        return normalizeProject(doc);
    });

    ipcMain.handle("projects:delete", async (_event, id: string) => {
        await ensureConnection();
        await await Project.deleteOne({ _id: id });
        return { ok: true };
    });

    ipcMain.handle("categories:list", async () => {
        await ensureConnection();
        const docs = await Category.find().sort({ title: 1 }).lean();
        return docs.map((c) => ({ id: c._id.toString(), title: c.title }));
    });

    ipcMain.handle("categories:create", async (_event, titleRaw: string) => {
        await ensureConnection();
        const title = (titleRaw ?? "").trim();
        if (!title) throw new Error("Title is required");
        const existing = await Category.findOne({ title }).lean();
        if (existing) throw new Error("Category already exists");
        const doc = await Category.create({ title });
        return { id: doc._id.toString(), title: doc.title };
    });
}
