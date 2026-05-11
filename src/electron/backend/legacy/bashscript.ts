import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBashScript extends Document<Types.ObjectId> {
    title: string
    script: string
    description: string
    createdAt?: Date
    updatedAt?: Date
}

const bashScriptSchema = new Schema<IBashScript>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    script: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

bashScriptSchema.index({ title: 1 }, { unique: true });

const BashScript = mongoose.model<IBashScript>('BashScript', bashScriptSchema);

export default BashScript;
