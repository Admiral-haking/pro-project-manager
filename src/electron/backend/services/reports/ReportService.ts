import { FilterQuery, Model, PipelineStage, Types } from "mongoose";
import TransactionModel, { Transaction } from "../../models/Transaction";
import { asObjectId } from "../utils/validation";

export interface CategorySummaryParams {
    dateFrom?: Date;
    dateTo?: Date;
    accountIds?: Array<string | Types.ObjectId>;
    projectId?: string;
    type?: Transaction["type"];
    includePending?: boolean;
}

export interface CashflowSummaryParams {
    dateFrom?: Date;
    dateTo?: Date;
    accountIds?: Array<string | Types.ObjectId>;
    includePending?: boolean;
}

export interface ProjectSummaryParams {
    dateFrom?: Date;
    dateTo?: Date;
    includePending?: boolean;
}

export class ReportService {
    private readonly transactions: Model<Transaction>;

    constructor(transactionModel: Model<Transaction> = TransactionModel) {
        this.transactions = transactionModel;
    }

    private baseMatch(params: { includePending?: boolean; dateFrom?: Date; dateTo?: Date }): FilterQuery<Transaction> {
        const match: FilterQuery<Transaction> = {
            isVoided: { $ne: true }
        };

        if (!params.includePending) {
            match.status = "cleared";
        }

        if (params.dateFrom || params.dateTo) {
            match.date = {};
            if (params.dateFrom) match.date.$gte = params.dateFrom;
            if (params.dateTo) match.date.$lte = params.dateTo;
        }

        return match;
    }

    private signedAmountProjection(accountId?: Types.ObjectId) {
        // accountId is unused for now but left for future per-account summaries
        return {
            $switch: {
                branches: [
                    { case: { $eq: ["$type", "income"] }, then: "$amount" },
                    { case: { $eq: ["$type", "expense"] }, then: { $multiply: ["$amount", -1] } },
                    {
                        case: { $and: [{ $eq: ["$type", "refund"] }, { $eq: ["$direction", "in"] }] },
                        then: "$amount"
                    },
                    {
                        case: { $and: [{ $eq: ["$type", "refund"] }, { $eq: ["$direction", "out"] }] },
                        then: { $multiply: ["$amount", -1] }
                    },
                    {
                        case: { $and: [{ $eq: ["$type", "adjustment"] }, { $eq: ["$direction", "in"] }] },
                        then: "$amount"
                    },
                    {
                        case: { $and: [{ $eq: ["$type", "adjustment"] }, { $eq: ["$direction", "out"] }] },
                        then: { $multiply: ["$amount", -1] }
                    }
                ],
                default: 0
            }
        };
    }

    async summarizeByCategory(params: CategorySummaryParams = {}) {
        const match: FilterQuery<Transaction> = {
            ...this.baseMatch(params)
        };

        match.type = params.type
            ? params.type
            : { $in: ["income", "expense", "adjustment", "refund"] };

        if (params.accountIds?.length) {
            match.accountId = { $in: params.accountIds.map((id) => asObjectId(id)) };
        }
        if (params.projectId) {
            match["links.projectId"] = params.projectId;
        }

        const pipeline: PipelineStage[] = [
            { $match: match },
            {
                $project: {
                    categoryId: 1,
                    signedAmount: this.signedAmountProjection()
                }
            },
            { $match: { signedAmount: { $ne: 0 } } },
            { $group: { _id: "$categoryId", total: { $sum: "$signedAmount" } } },
            { $sort: { total: -1 as const } }
        ];

        const rows = await this.transactions.aggregate(pipeline).exec();
        const totalAbs = rows.reduce((sum, row) => sum + Math.abs(row.total ?? 0), 0) || 1;

        return rows.map((row) => ({
            categoryId: row._id ?? null,
            total: row.total,
            percentage: Math.abs(row.total ?? 0) / totalAbs
        }));
    }

    async summarizeCashflow(params: CashflowSummaryParams = {}) {
        const match: FilterQuery<Transaction> = {
            ...this.baseMatch(params),
            type: { $in: ["income", "expense", "refund"] }
        };

        if (params.accountIds?.length) {
            match.accountId = { $in: params.accountIds.map((id) => asObjectId(id)) };
        }

        const pipeline: PipelineStage[] = [
            { $match: match },
            {
                $group: {
                    _id: null,
                    income: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$type", "income"] },
                                        { $and: [{ $eq: ["$type", "refund"] }, { $eq: ["$direction", "in"] }] }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$type", "expense"] },
                                        { $and: [{ $eq: ["$type", "refund"] }, { $eq: ["$direction", "out"] }] }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            }
        ];

        const [row] = await this.transactions.aggregate(pipeline).exec();
        const income = row?.income ?? 0;
        const expense = row?.expense ?? 0;

        return {
            income,
            expense,
            net: income - expense
        };
    }

    async summarizeByProject(params: ProjectSummaryParams = {}) {
        const match: FilterQuery<Transaction> = {
            ...this.baseMatch(params),
            "links.projectId": { $exists: true, $ne: null }
        };

        const pipeline: PipelineStage[] = [
            { $match: match },
            {
                $project: {
                    projectId: "$links.projectId",
                    signedAmount: this.signedAmountProjection()
                }
            },
            { $match: { signedAmount: { $ne: 0 } } },
            { $group: { _id: "$projectId", total: { $sum: "$signedAmount" } } },
            { $sort: { total: -1 as const } }
        ];

        return this.transactions.aggregate(pipeline).exec();
    }
}

export default ReportService;
