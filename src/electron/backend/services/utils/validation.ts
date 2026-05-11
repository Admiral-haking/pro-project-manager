import { Types } from "mongoose";

export function asObjectId(id: string | Types.ObjectId | undefined | null, field = "id"): Types.ObjectId {
    if (!id) {
        throw new Error(`${field} is required`);
    }
    const value = typeof id === "string" ? new Types.ObjectId(id) : id;
    if (!Types.ObjectId.isValid(value)) {
        throw new Error(`${field} is not a valid ObjectId`);
    }
    return value;
}

export function ensurePositive(value: number, field: string) {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
        throw new Error(`${field} must be a number greater than zero`);
    }
}

export function ensureRateInRange(rate: number | undefined, field: string) {
    if (rate === undefined || rate === null) {
        throw new Error(`${field} is required`);
    }
    if (rate < 0 || rate > 1) {
        throw new Error(`${field} must be between 0 and 1`);
    }
}

export function assertCurrencyMatch(actual: string, expected: string, context: string) {
    if (actual.toUpperCase() !== expected.toUpperCase()) {
        throw new Error(`${context}: currency mismatch (${actual} vs ${expected})`);
    }
}
