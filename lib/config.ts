// Platform configuration - single source of truth
// Change values here and they update everywhere (translations, pages, etc.)

export const PLATFORM_CONFIG = {
  // Revenue
  publisherRevenueShare: 70,    // publisher gets 70%
  platformCommission: 30,       // platform takes 30%

  // Minimums
  minBudget: 1,                 // minimum campaign budget in AZN
  minWithdrawal: 5,             // minimum withdrawal in AZN
  minCpcBid: 0.01,              // minimum CPC bid in AZN
  minCpmBid: 0.01,              // minimum CPM bid in AZN

  // Currency
  currency: 'AZN',
};
