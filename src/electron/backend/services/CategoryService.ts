import { FilterQuery, Model, Types } from "mongoose";
import CategoryModel, { Category, CategoryKind } from "../models/Category";
import { asObjectId } from "./utils/validation";

export interface CategoryServiceOptions {
    categoryModel?: Model<Category>;
}

export interface CategoryFilter {
    archived?: boolean;
    kind?: CategoryKind;
    parentCategoryId?: string | Types.ObjectId | null;
}

export class CategoryService {
    private readonly categories: Model<Category>;

    constructor(options?: CategoryServiceOptions) {
        this.categories = options?.categoryModel ?? CategoryModel;
    }

    private normalizeName(name: string) {
        return name.trim().toLowerCase();
    }

    async createCategory(data: Pick<Category, "name"> & Partial<Category>): Promise<Category> {
        const normalizedName = this.normalizeName(data.name);

        const existing = await this.categories.findOne({ normalizedName }).lean();
        if (existing) {
            throw new Error(`Category with name "${data.name}" already exists`);
        }

        if (data.parentCategoryId) {
            const parent = await this.categories.findById(data.parentCategoryId).lean();
            if (!parent) throw new Error("Parent category not found");
        }

        return this.categories.create({
            name: data.name.trim(),
            normalizedName,
            kind: data.kind ?? "expense",
            parentCategoryId: data.parentCategoryId ?? null,
            archived: data.archived ?? false
        });
    }

    async updateCategory(id: string | Types.ObjectId, patch: Partial<Category>): Promise<Category | null> {
        const categoryId = asObjectId(id);
        const update: Partial<Category> = {};

        if (patch.name !== undefined) {
            update.name = patch.name.trim();
            update.normalizedName = this.normalizeName(patch.name);
        }
        if (patch.kind !== undefined) update.kind = patch.kind;
        if (patch.parentCategoryId !== undefined) {
            if (patch.parentCategoryId) {
                const parent = await this.categories.findById(patch.parentCategoryId).lean();
                if (!parent) throw new Error("Parent category not found");
                if (parent._id.toString() === categoryId.toString()) throw new Error("Category cannot be its own parent");
            }
            update.parentCategoryId = patch.parentCategoryId;
        }
        if (patch.archived !== undefined) update.archived = patch.archived;

        return this.categories.findByIdAndUpdate(categoryId, update, { new: true });
    }

    async listCategories(filter: CategoryFilter = {}): Promise<Category[]> {
        const query: FilterQuery<Category> = {};
        if (filter.archived !== undefined) query.archived = filter.archived;
        if (filter.kind) query.kind = filter.kind;
        if (filter.parentCategoryId !== undefined) {
            query.parentCategoryId = filter.parentCategoryId === null ? null : asObjectId(filter.parentCategoryId);
        }

        return this.categories.find(query).sort({ archived: 1, name: 1 }).lean();
    }

    async archiveCategory(id: string | Types.ObjectId): Promise<Category | null> {
        const categoryId = asObjectId(id);
        return this.categories.findByIdAndUpdate(categoryId, { archived: true }, { new: true });
    }
}

export default CategoryService;
