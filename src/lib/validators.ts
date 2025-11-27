/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Phone number validation (Indian format)
   */
  export function isValidPhone(phone: string): boolean {
    // Accepts formats: 9876543210, +919876543210, 09876543210
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
  }
  
  /**
   * GST number validation
   */
  export function isValidGST(gst: string): boolean {
    // Format: 22AAAAA0000A1Z5
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  }
  
  /**
   * PAN number validation
   */
  export function isValidPAN(pan: string): boolean {
    // Format: AAAAA9999A
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }
  
  /**
   * Indian pincode validation
   */
  export function isValidPincode(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }
  
  /**
   * IFSC code validation
   */
  export function isValidIFSC(ifsc: string): boolean {
    // Format: ABCD0123456
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  }
  
  /**
   * Bank account number validation
   */
  export function isValidAccountNumber(accountNumber: string): boolean {
    // Account number should be 9-18 digits
    const accountRegex = /^[0-9]{9,18}$/;
    return accountRegex.test(accountNumber);
  }
  
  /**
   * Password strength validation
   */
  export function isStrongPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
  
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * URL validation
   */
  export function isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Validate price (must be positive number)
   */
  export function isValidPrice(price: number): boolean {
    return !isNaN(price) && price > 0;
  }
  
  /**
   * Validate quantity (must be positive integer)
   */
  export function isValidQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0;
  }
  
  /**
   * Validate date (must be in future)
   */
  export function isValidFutureDate(date: Date | number): boolean {
    const dateValue = date instanceof Date ? date.getTime() : date;
    return dateValue > Date.now();
  }
  
  /**
   * Validate event date range
   */
  export function isValidDateRange(startDate: Date | number, endDate: Date | number): boolean {
    const start = startDate instanceof Date ? startDate.getTime() : startDate;
    const end = endDate instanceof Date ? endDate.getTime() : endDate;
    return start < end && start > Date.now();
  }
  
  /**
   * Sanitize string input
   */
  export function sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }
  
  /**
   * Validate booking number format
   */
  export function isValidBookingNumber(bookingNumber: string): boolean {
    // Format: BK-YYYYMMDD-XXXXX
    const bookingRegex = /^BK-\d{8}-[A-Z0-9]{5}$/;
    return bookingRegex.test(bookingNumber);
  }
  
  /**
   * Validate TAN number (Tax Deduction Account Number)
   */
  export function isValidTAN(tan: string): boolean {
    // Format: AAAA99999A
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
    return tanRegex.test(tan);
  }
  
  /**
   * Form validation helper
   */
  export function validateForm(fields: Record<string, any>, rules: Record<string, (value: any) => boolean | string>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
  
    for (const [field, rule] of Object.entries(rules)) {
      const result = rule(fields[field]);
      if (result !== true) {
        errors[field] = typeof result === "string" ? result : "Invalid value";
      }
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }