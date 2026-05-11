export interface UsdRateProvider {
    /**
     * Returns the USD price of one unit of the given currency at the specified moment.
     * Implementations should be deterministic for the same inputs to preserve historical
     * snapshots on stored transactions.
     */
    getUsdPrice(currency: string, at: Date): Promise<number>;
}
