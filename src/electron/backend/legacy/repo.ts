import mongoose, { Document, Schema, Types } from "mongoose";
import { IProject } from "./project";

export interface IRepo extends Document<Types.ObjectId> {
    projectId: Types.ObjectId
    title: string
    path: string
    devCommand: string
    buildCommand: string
    scripts: {
        name: string
        code: string
        language: string
        run_command: string
    }[]
    icon: string[]
    createdAt?: Date
    updatedAt?: Date

    project?: IProject

    ignore: string
}

const deployScriptSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    run_command: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const repoSchema = new Schema<IRepo>({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    devCommand: {
        type: String,
        trim: true,
        default: ''
    },
    buildCommand: {
        type: String,
        trim: true,
        default: ''
    },
    scripts: {
        type: [deployScriptSchema],
        required: false
    },
    icon: {
        type: [String],
        trim: true,
        default: []
    }
}, {
    timestamps: true
});

repoSchema.index({ title: 1, projectId: 1 }, { unique: true });

const Repository = mongoose.model<IRepo>('Repository', repoSchema);

export default Repository;
