import { ClientSession, FilterQuery, Model, Types } from "mongoose";
import AccountModel, { Account } from "../models/Account";
import TransactionModel, { Transaction } from "../models/Transaction";
import { asObjectId } from "./utils/validation";

export interface AccountServiceOptions {
    accountModel?: Model<Account>;
    transactionModel?: Model<Transaction>;
}

export interface AccountFilter {
    archived?: boolean;
    type?: Account["type"];
    currency?: string;
}

export class AccountService {
    private readonly accounts: Model<Account>;
    private readonly transactions: Model<Transaction>;

    constructor(options?: AccountServiceOptions) {
        this.accounts = options?.accountModel ?? AccountModel;
        this.transactions = options?.transactionModel ?? TransactionModel;
    }

    async createAccount(data: Pick<Account, "name" | "type" | "currency"> & Partial<Account>): Promise<Account> {
        const payload = {
            name: data.name.trim(),
            type: data.type,
            currency: data.currency.toUpperCase(),
            openingBalance: data.openingBalance ?? 0,
            archived: data.archived ?? false
        };

        return this.accounts.create(payload);
    }

    async updateAccount(id: string | Types.ObjectId, patch: Partial<Account>): Promise<Account | null> {
        const accountId = asObjectId(id);
        const update: Partial<Account> = {};

        if (patch.name !== undefined) update.name = patch.name.trim();
        if (patch.type !== undefined) update.type = patch.type;
        if (patch.currency !== undefined) update.currency = patch.currency.toUpperCase();
        if (patch.openingBalance !== undefined) update.openingBalance = patch.openingBalance;
        if (patch.archived !== undefined) update.archived = patch.archived;

        return this.accounts.findByIdAndUpdate(accountId, update, { new: true });
    }

    async listAccounts(filter: AccountFilter = {}): Promise<Account[]> {
        const query: FilterQuery<Account> = {};
        if (filter.archived !== undefined) query.archived = filter.archived;
        if (filter.type) query.type = filter.type;
        if (filter.currency) query.currency = filter.currency.toUpperCase();

        return this.accounts.find(query).sort({ archived: 1, name: 1 }).lean();
    }

    async getAccount(id: string | Types.ObjectId): Promise<Account | null> {
        const accountId = asObjectId(id);
        return this.accounts.findById(accountId).lean();
    }

    async archiveAccount(id: string | Types.ObjectId): Promise<Account | null> {
        const accountId = asObjectId(id);
        return this.accounts.findByIdAndUpdate(accountId, { archived: true }, { new: true });
    }

    async getAccountBalance(
        id: string | Types.ObjectId,
        options: { atDate?: Date; includePending?: boolean; session?: ClientSession } = {}
    ): Promise<number> {
        const accountId = asObjectId(id);
        const account = await this.accounts.findById(accountId).lean();
        if (!account) {
            throw new Error("Account not found");
        }

        const match: FilterQuery<Transaction> = {
            isVoided: { $ne: true },
            $or: [
                { accountId },
                { toAccountId: accountId }
            ]
        };

        if (options.atDate) {
            match.date = { $lte: options.atDate };
        }

        if (!options.includePending) {
            match.status = "cleared";
        }

        const pipeline = [
            { $match: match },
            {
                $project: {
                    amount: 1,
                    type: 1,
                    accountId: 1,
                    toAccountId: 1,
                    direction: 1,
                    delta: {
                        $switch: {
                            branches: [
                                { case: { $and: [{ $eq: ["$type", "transfer"] }, { $eq: ["$toAccountId", accountId] }] }, then: "$amount" },
                                { case: { $and: [{ $eq: ["$type", "transfer"] }, { $eq: ["$accountId", accountId] }] }, then: { $multiply: ["$amount", -1] } },
                                { case: { $and: [{ $eq: ["$type", "income"] }, { $eq: ["$accountId", accountId] }] }, then: "$amount" },
                                { case: { $and: [{ $eq: ["$type", "expense"] }, { $eq: ["$accountId", accountId] }] }, then: { $multiply: ["$amount", -1] } },
                                { case: { $and: [{ $eq: ["$type", "adjustment"] }, { $eq: ["$accountId", accountId] }, { $eq: ["$direction", "in"] }] }, then: "$amount" },
                                { case: { $and: [{ $eq: ["$type", "adjustment"] }, { $eq: ["$accountId", accountId] }, { $eq: ["$direction", "out"] }] }, then: { $multiply: ["$amount", -1] } },
                                { case: { $and: [{ $eq: ["$type", "refund"] }, { $eq: ["$accountId", accountId] }, { $eq: ["$direction", "in"] }] }, then: "$amount" },
                                { case: { $and: [{ $eq: ["$type", "refund"] }, { $eq: ["$accountId", accountId] }, { $eq: ["$direction", "out"] }] }, then: { $multiply: ["$amount", -1] } }
                            ],
                            default: 0
                        }
                    }
                }
            },
            { $group: { _id: null, total: { $sum: "$delta" } } }
        ];

        const aggregate = this.transactions.aggregate(pipeline);
        if (options.session) {
            aggregate.session(options.session);
        }
        const result = await aggregate.exec();
        const delta = result[0]?.total ?? 0;

        return account.openingBalance + delta;
    }
}

export default AccountService;
