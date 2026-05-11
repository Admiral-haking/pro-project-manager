import mongoose, { Document, Schema, Types } from "mongoose";

export interface IServer extends Document<Types.ObjectId> {
    title: string
    host: string
    port: string
    users: {
        username: string,
        password: string,
        privateKey: string
        sudo: boolean
    }[]
    createdAt?: Date
    updatedAt?: Date
}

const serverSchema = new Schema<IServer>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    host: {
        type: String,
        required: true,
        trim: true
    },
    port: {
        type: String,
        required: true,
        trim: true,
        default: '22'
    },
    users: {
        type: [{
            username: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100
            },
            password: {
                type: String,
            },
            privateKey: {
                type: String,
            },
            sudo: {
                type: Boolean,
                default: false
            }
        }]
    }
}, {
    timestamps: true
});

serverSchema.index({ host: 1, port: 1 }, { unique: true });

const Server = mongoose.model<IServer>('Server', serverSchema);

export default Server;
