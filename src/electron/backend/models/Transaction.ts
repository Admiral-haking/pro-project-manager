import mongoose, { Document, Schema, Types } from "mongoose";

export const TRANSACTION_TYPES = ["income", "expense", "transfer", "adjustment", "refund"] as const;
export const TRANSACTION_STATUSES = ["pending", "cleared"] as const;
export const TAX_MODES = ["none", "inclusive", "exclusive"] as const;
export const ADJUSTMENT_DIRECTIONS = ["in", "out"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
export type TaxMode = (typeof TAX_MODES)[number];
export type AdjustmentDirection = (typeof ADJUSTMENT_DIRECTIONS)[number];

export interface Transaction extends Document<Types.ObjectId> {
    date: Date;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    usd_price: number;
    accountId?: Types.ObjectId;
    toAccountId?: Types.ObjectId;
    categoryId?: Types.ObjectId;
    payee?: string;
    memo?: string;
    tags?: string[];
    links?: {
        projectId?: string;
        contractorId?: string;
        serverId?: string;
        repoId?: string;
        todoId?: string;
    };
    taxMode: TaxMode;
    taxRate?: number;
    taxAmount?: number;
    netAmount?: number;
    grossAmount?: number;
    direction?: AdjustmentDirection;
    feeAmount?: number;
    feeCategoryId?: Types.ObjectId;
    feeAccountId?: Types.ObjectId;
    relatedTransactionId?: Types.ObjectId;
    feeTransactionId?: Types.ObjectId;
    isVoided?: boolean;
    voidedAt?: Date | null;
    voidReason?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const transactionSchema = new Schema<Transaction>({
    date: {
        type: Date,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: TRANSACTION_TYPES,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: TRANSACTION_STATUSES,
        default: "cleared",
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    usd_price: {
        type: Number,
        required: true
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: "Account"
    },
    toAccountId: {
        type: Schema.Types.ObjectId,
        ref: "Account"
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    payee: {
        type: String,
        trim: true,
        maxlength: 200
    },
    memo: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    tags: {
        type: [String],
        default: []
    },
    links: {
        projectId: String,
        contractorId: String,
        serverId: String,
        repoId: String,
        todoId: String
    },
    taxMode: {
        type: String,
        enum: TAX_MODES,
        default: "none"
    },
    taxRate: {
        type: Number,
        min: 0,
        max: 1
    },
    taxAmount: {
        type: Number,
        min: 0
    },
    netAmount: {
        type: Number,
        min: 0
    },
    grossAmount: {
        type: Number,
        min: 0
    },
    direction: {
        type: String,
        enum: ADJUSTMENT_DIRECTIONS
    },
    feeAmount: {
        type: Number,
        min: 0
    },
    feeCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    feeAccountId: {
        type: Schema.Types.ObjectId,
        ref: "Account"
    },
    relatedTransactionId: {
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    },
    feeTransactionId: {
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    },
    isVoided: {
        type: Boolean,
        default: false,
        index: true
    },
    voidedAt: {
        type: Date,
        default: null
    },
    voidReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null
    }
}, {
    timestamps: true
});

transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ accountId: 1, date: -1 });
transactionSchema.index({ toAccountId: 1, date: -1 });
transactionSchema.index({ categoryId: 1, date: -1 });
transactionSchema.index({ "links.projectId": 1, date: -1 });
transactionSchema.index({ payee: "text", memo: "text" });

const TransactionModel = mongoose.model<Transaction>("Transaction", transactionSchema);

export default TransactionModel;
