import mongoose, { Document, Schema, Types } from "mongoose";

const PRIORITY_LEVELS = ["low", "medium", "high"] as const;
const LABEL_COLORS = ["primary", "secondary", "success", "warning", "info"] as const;

type PriorityLevel = typeof PRIORITY_LEVELS[number];
type LabelColor = typeof LABEL_COLORS[number];

export interface IReminder extends Document<Types.ObjectId> {
    title: string;
    deadline: Date;
    content: string;
    priority: PriorityLevel;
    tag?: string;
    color: LabelColor;
    isCompleted: boolean;
    remindBeforeMinutes: number;
    snoozeUntil?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const reminderSchema = new Schema<IReminder>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    deadline: {
        type: Date,
        default: () => new Date(Date.now() + (1e3 * 60 * 60 * 24 * 2)),
        index: true
    },
    content: {
        type: String,
        default: ""
    },
    priority: {
        type: String,
        enum: PRIORITY_LEVELS,
        default: "medium",
        index: true
    },
    tag: {
        type: String,
        trim: true,
        maxlength: 50,
        default: "General"
    },
    color: {
        type: String,
        enum: LABEL_COLORS,
        default: "primary"
    },
    isCompleted: {
        type: Boolean,
        default: false,
        index: true
    },
    remindBeforeMinutes: {
        type: Number,
        default: 30,
        min: 0,
        max: 1440
    },
    snoozeUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

reminderSchema.index({ deadline: 1, priority: 1, isCompleted: 1 });

const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);

export default Reminder;
