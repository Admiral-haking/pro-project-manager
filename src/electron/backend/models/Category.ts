import mongoose, { Document, Schema, Types } from "mongoose";

export const CATEGORY_KINDS = ["income", "expense", "both"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export interface Category extends Document<Types.ObjectId> {
    name: string;
    normalizedName: string;
    kind: CategoryKind;
    parentCategoryId?: Types.ObjectId | null;
    archived: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const categorySchema = new Schema<Category>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    normalizedName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    kind: {
        type: String,
        enum: CATEGORY_KINDS,
        default: "expense",
        index: true
    },
    parentCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null,
        index: true
    },
    archived: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

categorySchema.index({ normalizedName: 1 }, { unique: true });
categorySchema.index({ parentCategoryId: 1 });

categorySchema.pre("validate", function setNormalizedName(next) {
    if (this.name) {
        this.normalizedName = this.name.trim().toLowerCase();
    }
    next();
});

const CategoryModel = mongoose.model<Category>("Category", categorySchema);

export default CategoryModel;
