/**
 * Currency utilities for consistent rupee symbol display
 * Uses encoding-safe methods to prevent corruption
 */

import React from 'react';

// Rupee symbol using Unicode escape (encoding-safe)
export const RUPEE_SYMBOL = '\u20B9';

// Currency configuration
export const CURRENCY = {
  SYMBOL: RUPEE_SYMBOL,
  CODE: 'INR',
  LOCALE: 'en-IN',
} as const;

/**
 * Format amount as Indian currency
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "₹1,000")
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, decimals = 0 } = options || {};
  
  const formatted = amount.toLocaleString(CURRENCY.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${CURRENCY.SYMBOL}${formatted}` : formatted;
}

/**
 * Format amount in compact form (K, L, Cr)
 * @param amount - Amount to format
 * @returns Compact formatted string (e.g., "₹1.5L")
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 10000000) {
    // Crores
    return `${CURRENCY.SYMBOL}${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    // Lakhs
    return `${CURRENCY.SYMBOL}${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    // Thousands
    return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(2)}K`;
  }
  return `${CURRENCY.SYMBOL}${amount.toFixed(0)}`;
}

/**
 * React component for rupee symbol
 * Uses HTML entity for maximum compatibility
 */
export function Rupee(): React.ReactElement {
  return <>&#8377;</>;
}
