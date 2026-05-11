import { Types } from "mongoose";
import { AdjustmentDirection, TransactionType } from "../../models/Transaction";

export interface LedgerLikeTransaction {
    type: TransactionType;
    amount: number;
    accountId?: Types.ObjectId | null;
    toAccountId?: Types.ObjectId | null;
    direction?: AdjustmentDirection;
    isVoided?: boolean;
}

export function calculateDeltaForAccount(
    tx: LedgerLikeTransaction,
    accountId: Types.ObjectId | string
): number {
    if (tx.isVoided) return 0;
    const id = accountId.toString();
    const fromId = tx.accountId ? tx.accountId.toString() : undefined;
    const toId = tx.toAccountId ? tx.toAccountId.toString() : undefined;

    switch (tx.type) {
        case "income":
            return fromId === id ? tx.amount : 0;
        case "expense":
            return fromId === id ? -tx.amount : 0;
        case "transfer":
            if (fromId === id) return -tx.amount;
            if (toId === id) return tx.amount;
            return 0;
        case "adjustment":
            if (fromId !== id || !tx.direction) return 0;
            return tx.direction === "in" ? tx.amount : -tx.amount;
        case "refund":
            if (fromId !== id || !tx.direction) return 0;
            return tx.direction === "in" ? tx.amount : -tx.amount;
        default:
            return 0;
    }
}
