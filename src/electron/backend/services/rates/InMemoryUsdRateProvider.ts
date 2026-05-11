import { UsdRateProvider } from "./UsdRateProvider";

export type RateTable = Record<string, number>;

export class InMemoryUsdRateProvider implements UsdRateProvider {
    private readonly rates: Map<string, number>;

    constructor(seed?: RateTable) {
        const defaultRates: RateTable = {
            USD: 1,
            USDT: 1,
            EUR: 1.08,
            IRT: 0.000024,
            BTC: 50000
        };

        this.rates = new Map<string, number>(
            Object.entries({
                ...defaultRates,
                ...seed
            }).map(([code, value]) => [code.toUpperCase(), value])
        );
    }

    setRate(code: string, usdPrice: number) {
        this.rates.set(code.toUpperCase(), usdPrice);
    }

    async getUsdPrice(currency: string, _at: Date): Promise<number> {
        const rate = this.rates.get(currency.toUpperCase());
        if (rate === undefined) {
            throw new Error(`USD price not found for currency ${currency}`);
        }
        return rate;
    }
}
