import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory extends Document<Types.ObjectId> {
    title: string
    createdAt?: Date
    updatedAt?: Date
}

const categorySchema = new Schema<ICategory>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    }
}, {
    timestamps: true
});

categorySchema.index({ title: 1 }, { unique: true });

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
