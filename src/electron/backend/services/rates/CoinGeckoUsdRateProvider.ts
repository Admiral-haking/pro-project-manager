import { UsdRateProvider } from "./UsdRateProvider";

interface CoinGeckoExchangeRate {
    name: string;
    unit: string;
    value: number; // expressed as <unit> per 1 BTC
    type: string;
}

export interface CoinGeckoUsdRateProviderOptions {
    ttlMs?: number;
    fetchFn?: typeof fetch;
}

/**
    Uses CoinGecko's public exchange_rates endpoint (BTC-based) and derives USD price for a given currency.
    Formula: USD price of currency X = rates["USD"].value / rates["X"].value
    Because CoinGecko returns values as "1 BTC = <value> <unit>", the ratio gives USD per 1 unit of X.
*/
export class CoinGeckoUsdRateProvider implements UsdRateProvider {
    private readonly ttlMs: number;
    private readonly fetchFn: typeof fetch;
    private cache?: { at: number; rates: Map<string, CoinGeckoExchangeRate> };

    constructor(options: CoinGeckoUsdRateProviderOptions = {}) {
        this.ttlMs = options.ttlMs ?? 5 * 60 * 1000;
        this.fetchFn = options.fetchFn ?? fetch;
    }

    private async loadRates(): Promise<Map<string, CoinGeckoExchangeRate>> {
        const now = Date.now();
        if (this.cache && now - this.cache.at < this.ttlMs) {
            return this.cache.rates;
        }

        const res = await this.fetchFn("https://api.coingecko.com/api/v3/exchange_rates");
        if (!res.ok) {
            throw new Error(`CoinGecko exchange_rates failed with status ${res.status}`);
        }
        const data: { rates: Record<string, CoinGeckoExchangeRate> } = await res.json();
        const map = new Map<string, CoinGeckoExchangeRate>();
        for (const [code, rate] of Object.entries(data.rates ?? {})) {
            map.set(code.toUpperCase(), rate);
        }
        this.cache = { at: now, rates: map };
        return map;
    }

    async getUsdPrice(currency: string, _at: Date): Promise<number> {
        const code = currency.toUpperCase();
        if (code === "USD") return 1;

        const rates = await this.loadRates();
        const usd = rates.get("USD");
        const target = rates.get(code);

        if (!usd) {
            throw new Error("CoinGecko response missing USD rate");
        }
        if (!target) {
            throw new Error(`CoinGecko does not provide rate for currency ${code}`);
        }
        if (target.value === 0) {
            throw new Error(`CoinGecko returned zero value for currency ${code}`);
        }

        // rates are denominated as "<value> currency per 1 BTC"
        // USD per unit of target = usd.value / target.value
        return usd.value / target.value;
    }
}
