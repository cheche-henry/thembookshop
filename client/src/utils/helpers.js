/**
 * Format price in Kenyan Shillings
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return `KES ${Number(price).toLocaleString('en-KE')}`;
};

/**
 * Validate Kenyan phone number format for M-Pesa
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  return /^07\d{8}$/.test(cleaned) || /^01\d{8}$/.test(cleaned);
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate SKU from product name and ID
 * @param {string} name - Product name
 * @param {number} id - Product ID
 * @returns {string} Formatted SKU
 */
export const generateSKU = (name, id) => {
  const prefix = name.split(' ')[0].substring(0, 2).toUpperCase();
  return `${prefix}-${id.toString().padStart(4, '0')}`;
};