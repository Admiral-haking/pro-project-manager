import mongoose, { Document, Schema, Types } from "mongoose";

export interface INote extends Document<Types.ObjectId> {
    title: string
    content: {
        title: string,
        content: string
    }[]
    createdAt?: Date
    updatedAt?: Date
}

const noteSchema = new Schema<INote>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    content: {
        type: [{
            title: { type: String },
            content: { type: String }
        }],
        required: true
    }
}, {
    timestamps: true
});

noteSchema.index({ title: 1 });

const Note = mongoose.model<INote>('Note', noteSchema);

export default Note;
