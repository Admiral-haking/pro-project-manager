import { TaxMode } from "../../models/Transaction";

export interface TaxComputation {
    grossAmount: number;
    netAmount?: number;
    taxAmount?: number;
}

/**
 * Computes tax fields while keeping the persisted `amount` as the gross (cash) value.
 * - inclusive: `amount` already includes tax; we back out net/tax.
 * - exclusive: `amount` is treated as net and we build gross = net + tax, so callers
 *   should overwrite the stored amount with the returned `grossAmount`.
 */
export function computeTax(amount: number, taxMode: TaxMode, taxRate?: number): TaxComputation {
    if (amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    if (taxMode === "none" || !taxRate) {
        return { grossAmount: amount };
    }

    if (taxRate < 0 || taxRate > 1) {
        throw new Error("Tax rate must be between 0 and 1");
    }

    if (taxMode === "inclusive") {
        const netAmount = amount / (1 + taxRate);
        const taxAmount = amount - netAmount;
        return { grossAmount: amount, netAmount, taxAmount };
    }

    if (taxMode === "exclusive") {
        const netAmount = amount;
        const taxAmount = netAmount * taxRate;
        const grossAmount = netAmount + taxAmount;
        return { grossAmount, netAmount, taxAmount };
    }

    return { grossAmount: amount };
}
