/**
 * Utility functions for currency formatting
 */

/**
 * Formats a number as Philippine Peso currency with 2 decimal places
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "₱1,234.56")
 */
export const formatPHP = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formats a number as Philippine Peso without the currency symbol
 * @param amount - The numeric amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Parses a PHP currency string back to a number
 * @param currencyString - The currency string to parse (e.g., "₱1,234.56")
 * @returns The numeric value
 */
export const parsePHP = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[₱,]/g, ''));
};