import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContractor extends Document<Types.ObjectId> {
    name: string
    avatar?: string
    phones: string[]
    address?: string

    description?: string
    createdAt?: Date
    updatedAt?: Date
}

const contractorSchema = new Schema<IContractor>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    avatar: {
        type: String,
        trim: true
    },
    phones: {
        type: [String],
        default: [],
        set: (values: string[]) => values.map(value => value.trim()).filter(Boolean)
    },
    address: {
        type: String,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

contractorSchema.index({ name: 1 }, { unique: true });

const Contractor = mongoose.model<IContractor>('Contractor', contractorSchema);

export default Contractor;
