import { ClientSession, FilterQuery, Model, Types } from "mongoose";
import AccountModel, { Account } from "../models/Account";
import CategoryModel, { Category } from "../models/Category";
import TransactionModel, {
    AdjustmentDirection,
    TaxMode,
    Transaction,
    TransactionStatus,
    TransactionType
} from "../models/Transaction";
import { UsdRateProvider } from "./rates/UsdRateProvider";
import { computeTax } from "./utils/tax";
import { asObjectId, assertCurrencyMatch, ensurePositive, ensureRateInRange } from "./utils/validation";

export interface TransactionServiceOptions {
    transactionModel?: Model<Transaction>;
    accountModel?: Model<Account>;
    categoryModel?: Model<Category>;
    rateProvider: UsdRateProvider;
}

export interface TransactionCreateInput {
    type: TransactionType;
    date: Date;
    status?: TransactionStatus;
    amount: number;
    currency?: string;
    accountId?: string | Types.ObjectId;
    toAccountId?: string | Types.ObjectId;
    categoryId?: string | Types.ObjectId;
    payee?: string;
    memo?: string;
    tags?: string[];
    links?: Transaction["links"];
    taxMode?: TaxMode;
    taxRate?: number;
    feeAmount?: number;
    feeCategoryId?: string | Types.ObjectId;
    feeAccountId?: string | Types.ObjectId;
    direction?: AdjustmentDirection;
}

export interface TransactionUpdateInput extends Partial<TransactionCreateInput> {
    status?: TransactionStatus;
    type?: TransactionType;
}

export interface TransactionListFilter {
    accountIds?: Array<string | Types.ObjectId>;
    toAccountIds?: Array<string | Types.ObjectId>;
    categoryIds?: Array<string | Types.ObjectId>;
    types?: TransactionType[];
    status?: TransactionStatus | "all";
    dateFrom?: Date;
    dateTo?: Date;
    projectId?: string;
    includeVoided?: boolean;
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
}

export class TransactionService {
    private readonly transactions: Model<Transaction>;
    private readonly accounts: Model<Account>;
    private readonly categories: Model<Category>;
    private readonly rateProvider: UsdRateProvider;

    constructor(options: TransactionServiceOptions) {
        this.transactions = options.transactionModel ?? TransactionModel;
        this.accounts = options.accountModel ?? AccountModel;
        this.categories = options.categoryModel ?? CategoryModel;
        this.rateProvider = options.rateProvider;
    }

    private async getAccountOrThrow(id: string | Types.ObjectId | undefined, field: string): Promise<Account> {
        if (!id) throw new Error(`${field} is required`);
        const objectId = asObjectId(id, field);
        const account = await this.accounts.findById(objectId).lean();
        if (!account) {
            throw new Error(`Account not found for ${field}`);
        }
        return account;
    }

    private async getCategoryIfPresent(id?: string | Types.ObjectId | null): Promise<Category | null> {
        if (!id) return null;
        const objectId = asObjectId(id, "categoryId");
        const category = await this.categories.findById(objectId).lean();
        if (!category) {
            throw new Error("Category not found");
        }
        return category;
    }

    private deriveCurrency(type: TransactionType, account: Account | null, toAccount: Account | null, provided?: string): string {
        if (type === "transfer") {
            if (!account || !toAccount) throw new Error("accountId and toAccountId are required for transfers");
            assertCurrencyMatch(account.currency, toAccount.currency, "Transfer accounts must share currency");
            return account.currency.toUpperCase();
        }

        if (!account) throw new Error("accountId is required");
        if (provided) {
            assertCurrencyMatch(provided, account.currency, "Transaction currency must match account currency");
        }

        return account.currency.toUpperCase();
    }

    private requireDirection(type: TransactionType, direction?: AdjustmentDirection): AdjustmentDirection | undefined {
        if ((type === "adjustment" || type === "refund") && !direction) {
            throw new Error("Direction is required for adjustments and refunds");
        }
        return direction;
    }

    private async applyFeeForTransfer(params: {
        transfer: Transaction;
        feeAmount?: number;
        feeCategoryId?: Types.ObjectId;
        feeAccountId?: Types.ObjectId;
        date: Date;
        status: TransactionStatus;
        session?: ClientSession;
    }): Promise<Types.ObjectId | undefined> {
        const { transfer, feeAmount, feeCategoryId, feeAccountId, date, status } = params;
        if (!feeAmount || feeAmount <= 0) return undefined;

        const feeAccount = await this.getAccountOrThrow(feeAccountId ?? transfer.accountId, "feeAccountId");
        ensurePositive(feeAmount, "feeAmount");

        const usdPrice = await this.rateProvider.getUsdPrice(feeAccount.currency, date);
        const [feeTx] = await this.transactions.create([{
            date,
            type: "expense",
            status,
            amount: feeAmount,
            currency: feeAccount.currency.toUpperCase(),
            usd_price: usdPrice,
            accountId: feeAccount._id,
            categoryId: feeCategoryId,
            relatedTransactionId: transfer._id,
            memo: `Transfer fee for tx ${transfer._id.toString()}`,
            taxMode: "none",
            grossAmount: feeAmount
        }], { session: params.session });

        await this.transactions.updateOne(
            { _id: transfer._id },
            { $set: { feeTransactionId: feeTx._id } },
            { session: params.session }
        );

        return feeTx._id;
    }

    async createTransaction(
        input: TransactionCreateInput,
        options: { session?: ClientSession } = {}
    ): Promise<Transaction> {
        const type = input.type;
        const date = new Date(input.date);
        ensurePositive(input.amount, "amount");

        const account = ["income", "expense", "adjustment", "refund", "transfer"].includes(type)
            ? await this.getAccountOrThrow(input.accountId, "accountId")
            : null;
        const toAccount = type === "transfer"
            ? await this.getAccountOrThrow(input.toAccountId, "toAccountId")
            : null;

        if (type === "transfer" && account && toAccount && account._id.toString() === toAccount._id.toString()) {
            throw new Error("Transfer accounts must be different");
        }

        await this.getCategoryIfPresent(input.categoryId);

        const direction = this.requireDirection(type, input.direction);
        const currency = this.deriveCurrency(type, account, toAccount, input.currency);
        const taxMode = input.taxMode ?? "none";
        if (taxMode !== "none") {
            ensureRateInRange(input.taxRate, "taxRate");
        }
        const tax = computeTax(input.amount, taxMode, input.taxRate);
        const usdPrice = await this.rateProvider.getUsdPrice(currency, date);

        const payload: Partial<Transaction> = {
            date,
            type,
            status: input.status ?? "cleared",
            amount: tax.grossAmount,
            currency,
            usd_price: usdPrice,
            accountId: account?._id,
            toAccountId: toAccount?._id,
            categoryId: input.categoryId ? asObjectId(input.categoryId) : undefined,
            payee: input.payee,
            memo: input.memo,
            tags: input.tags,
            links: input.links,
            taxMode,
            taxRate: input.taxRate,
            taxAmount: tax.taxAmount,
            netAmount: tax.netAmount,
            grossAmount: tax.grossAmount,
            direction,
            feeAmount: input.feeAmount,
            feeCategoryId: input.feeCategoryId ? asObjectId(input.feeCategoryId) : undefined,
            feeAccountId: input.feeAccountId ? asObjectId(input.feeAccountId) : account?._id
        };

        if (type !== "transfer") {
            const [created] = await this.transactions.create([payload], { session: options.session });
            return created;
        }

        const session = options.session ?? await this.transactions.startSession();
        let createdTransfer: Transaction | null = null;

        const run = async () => {
            const [transfer] = await this.transactions.create([payload], { session });
            await this.applyFeeForTransfer({
                transfer,
                feeAmount: input.feeAmount,
                feeCategoryId: input.feeCategoryId ? asObjectId(input.feeCategoryId) : undefined,
                feeAccountId: input.feeAccountId ? asObjectId(input.feeAccountId) : account?._id,
                date,
                status: payload.status as TransactionStatus,
                session
            });
            createdTransfer = await this.transactions.findById(transfer._id).session(session).lean();
        };

        if (options.session) {
            await run();
        } else {
            await session.withTransaction(run);
            await session.endSession();
        }

        if (!createdTransfer) {
            throw new Error("Failed to create transfer transaction");
        }
        return createdTransfer as Transaction;
    }

    async updateTransaction(
        id: string | Types.ObjectId,
        patch: TransactionUpdateInput,
        options: { session?: ClientSession } = {}
    ): Promise<Transaction | null> {
        const txId = asObjectId(id);
        const existing = await this.transactions.findById(txId);
        if (!existing) throw new Error("Transaction not found");
        if (existing.isVoided) throw new Error("Cannot update a voided transaction");
        if (patch.type && patch.type !== existing.type) {
            throw new Error("Changing transaction type is not supported");
        }

        const type = existing.type;
        const accountId = patch.accountId ?? existing.accountId;
        const toAccountId = patch.toAccountId ?? existing.toAccountId;
        const account = ["income", "expense", "adjustment", "refund", "transfer"].includes(type)
            ? await this.getAccountOrThrow(accountId, "accountId")
            : null;
        const toAccount = type === "transfer"
            ? await this.getAccountOrThrow(toAccountId, "toAccountId")
            : null;

        if (type === "transfer" && account && toAccount && account._id.toString() === toAccount._id.toString()) {
            throw new Error("Transfer accounts must be different");
        }

        if (patch.categoryId) {
            await this.getCategoryIfPresent(patch.categoryId);
        }

        const direction = this.requireDirection(type, patch.direction ?? existing.direction);
        const date = patch.date ? new Date(patch.date) : existing.date;
        const currency = this.deriveCurrency(type, account, toAccount, patch.currency ?? existing.currency);

        const taxMode = patch.taxMode ?? existing.taxMode ?? "none";
        const taxRate = patch.taxRate ?? existing.taxRate;

        let grossAmount = existing.amount;
        let netAmount = existing.netAmount;
        let taxAmount = existing.taxAmount;

        if (patch.amount !== undefined || patch.taxMode !== undefined || patch.taxRate !== undefined) {
            if (patch.amount !== undefined) {
                ensurePositive(patch.amount, "amount");
            }
            const amountForCalc = patch.amount ?? (existing.taxMode === "exclusive" && existing.netAmount ? existing.netAmount : existing.amount);
            if (taxMode !== "none") {
                ensureRateInRange(taxRate, "taxRate");
            }
            const tax = computeTax(amountForCalc, taxMode, taxRate);
            grossAmount = tax.grossAmount;
            netAmount = tax.netAmount;
            taxAmount = tax.taxAmount;
        }

        const shouldUpdateUsd =
            currency.toUpperCase() !== existing.currency.toUpperCase() ||
            date.getTime() !== existing.date.getTime();

        const usdPrice = shouldUpdateUsd
            ? await this.rateProvider.getUsdPrice(currency, date)
            : existing.usd_price;

        const update: Partial<Transaction> = {
            date,
            status: patch.status ?? existing.status,
            amount: grossAmount,
            grossAmount,
            netAmount,
            taxAmount,
            currency,
            usd_price: usdPrice,
            accountId: account?._id,
            toAccountId: toAccount?._id,
            categoryId: patch.categoryId ? asObjectId(patch.categoryId) : existing.categoryId,
            payee: patch.payee ?? existing.payee,
            memo: patch.memo ?? existing.memo,
            tags: patch.tags ?? existing.tags,
            links: patch.links ?? existing.links,
            taxMode,
            taxRate,
            direction,
            feeAmount: patch.feeAmount ?? existing.feeAmount,
            feeCategoryId: patch.feeCategoryId ? asObjectId(patch.feeCategoryId) : existing.feeCategoryId,
            feeAccountId: patch.feeAccountId ? asObjectId(patch.feeAccountId) : existing.feeAccountId ?? account?._id
        };

        const session = options.session ?? await this.transactions.startSession();
        let updatedTx: Transaction | null = null;

        const run = async () => {
            await this.transactions.updateOne({ _id: txId }, { $set: update }, { session });
            if (type === "transfer") {
                const feeAmount = patch.feeAmount ?? existing.feeAmount;
                const feeCategoryId = patch.feeCategoryId ? asObjectId(patch.feeCategoryId) : existing.feeCategoryId;
                const feeAccountId = patch.feeAccountId ? asObjectId(patch.feeAccountId) : update.feeAccountId;
                if (feeAmount && feeAmount > 0) {
                    if (existing.feeTransactionId) {
                        const feeAccount = await this.getAccountOrThrow(feeAccountId ?? account?._id, "feeAccountId");
                        const feeUsd = await this.rateProvider.getUsdPrice(feeAccount.currency, date);
                        await this.transactions.updateOne(
                            { _id: existing.feeTransactionId },
                            {
                                $set: {
                                    amount: feeAmount,
                                    currency: feeAccount.currency.toUpperCase(),
                                    usd_price: feeUsd,
                                    accountId: feeAccount._id,
                                    categoryId: feeCategoryId,
                                    date,
                                    status: update.status,
                                    memo: `Transfer fee for tx ${txId.toString()}`,
                                    taxMode: "none",
                                    grossAmount: feeAmount,
                                    netAmount: undefined,
                                    taxAmount: undefined
                                }
                            },
                            { session }
                        );
                    } else {
                        const feeTxId = await this.applyFeeForTransfer({
                            transfer: { ...existing.toObject(), ...update, _id: txId } as Transaction,
                            feeAmount,
                            feeCategoryId,
                            feeAccountId,
                            date,
                            status: update.status as TransactionStatus,
                            session
                        });
                        if (feeTxId) {
                            update.feeTransactionId = feeTxId;
                            await this.transactions.updateOne({ _id: txId }, { $set: { feeTransactionId: feeTxId } }, { session });
                        }
                    }
                } else if (existing.feeTransactionId) {
                    await this.transactions.updateOne(
                        { _id: existing.feeTransactionId },
                        { $set: { isVoided: true, voidedAt: new Date(), voidReason: "Voided with parent transfer update" } },
                        { session }
                    );
                    await this.transactions.updateOne({ _id: txId }, { $unset: { feeTransactionId: 1 } }, { session });
                }
            }

            updatedTx = await this.transactions.findById(txId).session(session).lean();
        };

        if (options.session) {
            await run();
        } else {
            await session.withTransaction(run);
            await session.endSession();
        }

        return updatedTx;
    }

    async deleteTransaction(
        id: string | Types.ObjectId,
        reason = "Voided by user",
        options: { session?: ClientSession } = {}
    ): Promise<void> {
        const txId = asObjectId(id);
        const tx = await this.transactions.findById(txId).lean();
        if (!tx) return;

        const session = options.session ?? await this.transactions.startSession();
        const run = async () => {
            await this.transactions.updateOne(
                { _id: txId },
                { $set: { isVoided: true, voidedAt: new Date(), voidReason: reason } },
                { session }
            );

            if (tx.type === "transfer" && tx.feeTransactionId) {
                await this.transactions.updateOne(
                    { _id: tx.feeTransactionId },
                    { $set: { isVoided: true, voidedAt: new Date(), voidReason: `Voided with transfer ${txId.toString()}` } },
                    { session }
                );
            }
        };

        if (options.session) {
            await run();
        } else {
            await session.withTransaction(run);
            await session.endSession();
        }
    }

    async getTransaction(id: string | Types.ObjectId): Promise<Transaction | null> {
        const txId = asObjectId(id);
        return this.transactions.findById(txId).lean();
    }

    async listTransactions(filter: TransactionListFilter = {}): Promise<Transaction[]> {
        const query: FilterQuery<Transaction> = {};
        if (filter.accountIds && filter.accountIds.length) {
            query.accountId = { $in: filter.accountIds.map((v) => asObjectId(v)) };
        }
        if (filter.toAccountIds && filter.toAccountIds.length) {
            query.toAccountId = { $in: filter.toAccountIds.map((v) => asObjectId(v)) };
        }
        if (filter.categoryIds && filter.categoryIds.length) {
            query.categoryId = { $in: filter.categoryIds.map((v) => asObjectId(v)) };
        }
        if (filter.types && filter.types.length) {
            query.type = { $in: filter.types };
        }
        if (!filter.includeVoided) {
            query.isVoided = { $ne: true };
        }
        if (filter.status && filter.status !== "all") {
            query.status = filter.status;
        }
        if (filter.dateFrom || filter.dateTo) {
            query.date = {};
            if (filter.dateFrom) query.date.$gte = filter.dateFrom;
            if (filter.dateTo) query.date.$lte = filter.dateTo;
        }
        if (filter.projectId) {
            query["links.projectId"] = filter.projectId;
        }

        const limit = filter.limit ?? 100;
        const skip = filter.skip ?? 0;
        const sort = filter.sort ?? { date: -1, createdAt: -1 };

        return this.transactions.find(query).sort(sort).skip(skip).limit(limit).lean();
    }
}

export default TransactionService;

/*
Example usage (wire these up before IPC):

import AccountService from "./AccountService";
import TransactionService from "./TransactionService";
import ReportService from "./reports/ReportService";
import { CoinGeckoUsdRateProvider } from "./rates/CoinGeckoUsdRateProvider";

const rates = new CoinGeckoUsdRateProvider(); // uses live CoinGecko rates for usd_price snapshots
const accountService = new AccountService();
const transactionService = new TransactionService({ rateProvider: rates });
const reportService = new ReportService();

// 1) Create an expense in IRT (usd_price is stored from the provider)
const wallet = await accountService.createAccount({ name: "Cash Wallet", type: "wallet", currency: "IRT" });
await transactionService.createTransaction({
    type: "expense",
    accountId: wallet._id,
    date: new Date(),
    amount: 1_500_000,
    categoryId: undefined,
    taxMode: "none"
});

// 2) Transfer between Bank A and Bank B with a fee
const bankA = await accountService.createAccount({ name: "Bank A", type: "bank", currency: "USD" });
const bankB = await accountService.createAccount({ name: "Bank B", type: "bank", currency: "USD" });
await transactionService.createTransaction({
    type: "transfer",
    accountId: bankA._id,
    toAccountId: bankB._id,
    amount: 500,
    feeAmount: 5,
    feeCategoryId: undefined,
    date: new Date()
});

// 3) Category summary for this month
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
const summary = await reportService.summarizeByCategory({ dateFrom: startOfMonth, dateTo: endOfMonth });
*/
