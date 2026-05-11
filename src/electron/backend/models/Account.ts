import mongoose, { Document, Schema, Types } from "mongoose";

export const ACCOUNT_TYPES = ["bank", "wallet", "broker"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Account extends Document<Types.ObjectId> {
    name: string;
    type: AccountType;
    currency: string;
    openingBalance: number;
    archived: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const accountSchema = new Schema<Account>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ACCOUNT_TYPES,
        index: true
    },
    currency: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        index: true
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    archived: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

accountSchema.index({ archived: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ currency: 1 });

const AccountModel = mongoose.model<Account>("Account", accountSchema);

export default AccountModel;
