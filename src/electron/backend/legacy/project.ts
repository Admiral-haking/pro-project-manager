import mongoose, { Document, Schema, Types } from 'mongoose';
import { IContractor } from './contractor';
import { IRepo } from './repo';
import { IServer } from './server';
import { ICategory } from './category';


export interface IProject extends Document {
    title: string;
    priority: number;
    contractorIds: Types.ObjectId[];
    lastCheck: Date;
    serversIds: Types.ObjectId[];
    description?: string;
    categoryIds: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;

    contractors?: IContractor[]
    repos?: IRepo[]
    servers?: IServer[]
    categories?: ICategory[]
}


const projectSchema = new Schema<IProject>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    priority: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        required: true,
    },
    contractorIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Contractor'
    }],
    lastCheck: {
        type: Date,
        default: Date.now
    },
    serversIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Server'
    }],
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    categoryIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }]
}, {
    timestamps: true
});

// Text search index
projectSchema.index({ title: 'text', description: 'text' });

// Performance indexes
projectSchema.index({ contractorIds: 1 });
projectSchema.index({ categoryIds: 1 });
projectSchema.index({ lastCheck: 1 });

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
