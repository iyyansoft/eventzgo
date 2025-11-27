/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  /**
   * Format currency without symbol
   */
  export function formatCurrencyWithoutSymbol(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  /**
   * Format currency in compact form (1K, 1L, 1Cr)
   */
  export function formatCurrencyCompact(amount: number): string {
    if (amount >= 10000000) {
      // 1 Crore or more
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      // 1 Lakh or more
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      // 1 Thousand or more
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  }
  
  /**
   * Convert paise to rupees
   */
  export function paiseToRupees(paise: number): number {
    return paise / 100;
  }
  
  /**
   * Convert rupees to paise
   */
  export function rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }
  
  /**
   * Calculate GST amount
   */
  export function calculateGST(amount: number, gstPercentage: number = 18): number {
    return (amount * gstPercentage) / 100;
  }
  
  /**
   * Calculate amount with GST
   */
  export function addGST(amount: number, gstPercentage: number = 18): number {
    return amount + calculateGST(amount, gstPercentage);
  }
  
  /**
   * Calculate amount without GST (reverse calculation)
   */
  export function removeGST(amountWithGST: number, gstPercentage: number = 18): number {
    return amountWithGST / (1 + gstPercentage / 100);
  }
  
  /**
   * Calculate platform fee
   */
  export function calculatePlatformFee(
    amount: number,
    feePercentage: number = 5
  ): number {
    return (amount * feePercentage) / 100;
  }
  
  /**
   * Calculate total booking amount with fees
   */
  export function calculateBookingTotal(
    baseAmount: number,
    platformFeePercentage: number = 5,
    gstPercentage: number = 18
  ): {
    baseAmount: number;
    platformFee: number;
    subtotal: number;
    gst: number;
    total: number;
  } {
    const platformFee = calculatePlatformFee(baseAmount, platformFeePercentage);
    const subtotal = baseAmount + platformFee;
    const gst = calculateGST(subtotal, gstPercentage);
    const total = subtotal + gst;
  
    return {
      baseAmount,
      platformFee,
      subtotal,
      gst,
      total,
    };
  }
  
  /**
   * Format percentage
   */
  export function formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }
  
  /**
   * Parse currency string to number
   */
  export function parseCurrency(currencyString: string): number {
    return parseFloat(currencyString.replace(/[^0-9.-]+/g, ""));
  }
  
  /**
   * Format number in Indian numbering system
   */
  export function formatIndianNumber(num: number): string {
    return num.toLocaleString("en-IN");
  }
  
  /**
   * Calculate organiser payout (after platform fee)
   */
  export function calculateOrganiserPayout(
    totalAmount: number,
    platformFeePercentage: number = 5
  ): {
    grossAmount: number;
    platformFee: number;
    netPayout: number;
  } {
    const platformFee = (totalAmount * platformFeePercentage) / 100;
    const netPayout = totalAmount - platformFee;
  
    return {
      grossAmount: totalAmount,
      platformFee,
      netPayout,
    };
  }