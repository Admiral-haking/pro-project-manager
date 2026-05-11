import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISetting extends Document<Types.ObjectId> {
    key: string
    value: string
    createdAt?: Date
    updatedAt?: Date
}

const settingSchema = new Schema<ISetting>({
    key: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    value: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const Setting = mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;
