import { Types } from "mongoose";

export function deepParseObjectIds<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map(v => deepParseObjectIds(v)) as T;
    }

    if (value && typeof value === "object") {
        const obj: any = {};
        for (const [k, v] of Object.entries(value)) {
            obj[k] = deepParseObjectIds(v);
        }
        return obj as T;
    }

    // convert if string and valid ObjectId
    if (typeof value === "string" && Types.ObjectId.isValid(value)) {
        return new Types.ObjectId(value) as T;
    }

    return value;
}
