export function displayUserName(user) {
  if (!user || typeof user !== 'object') return '';

  // possible name fields from different responses
  const candidates = [
    user.username,
    user.UserName,
    user.name,
    user.displayName,
    user.fullName,
    user.firstName,
    user.first_name,
  ].filter(Boolean);

  if (candidates.length === 0) return '';

  const name = String(candidates[0]);

  // Hide auto-generated placeholder usernames like 'user12345' or 'user1600000000'
  if (/^user\d{3,}$/.test(name)) return '';

  // Also hide very short placeholder like 'u123'
  if (/^u\d{2,}$/.test(name)) return '';

  return name;
}

/**
 * Status encoding/decoding mappings
 */

// Repair Ticket Status Mappings
export const REPAIR_STATUS_ENCODE = {
  'Available': 'A',
  'Diagnosing': 'D',
  'In Progress': 'I',
  'Completed': 'C',
  'Payment Process': 'P',
  'Returned': 'R'
};

export const REPAIR_STATUS_DECODE = {
  'A': 'Available',
  'D': 'Diagnosing',
  'I': 'In Progress',
  'C': 'Completed',
  'P': 'Payment Process',
  'R': 'Returned'
};

// Supplier Order Status Mappings
export const SUPPLIER_STATUS_ENCODE = {
  'Pending': 'PE',
  'Processing': 'PR',
  'Shipped': 'S',
  'Delivered': 'D',
  'Rejected': 'R'
};

export const SUPPLIER_STATUS_DECODE = {
  'PE': 'Pending',
  'PR': 'Processing',
  'S': 'Shipped',
  'D': 'Delivered',
  'R': 'Rejected'
};

// Customer Bill Status Mappings
export const BILL_STATUS_ENCODE = {
  'Pending Payment': 'PP',
  'Paid': 'P',
  'Cancelled': 'C',
  'Refunded': 'R'
};

export const BILL_STATUS_DECODE = {
  'PP': 'Pending Payment',
  'P': 'Paid',
  'C': 'Cancelled',
  'R': 'Refunded'
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The string with first letter uppercase
 */
export function capitalizeFirstLetter(str) {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Encode status value to server format (single letter code)
 * @param {string} status - The human-readable status
 * @param {string} type - Type: 'repair', 'supplier', or 'bill'
 * @returns {string} - Encoded status
 */
export function encodeStatus(status, type = 'repair') {
  if (!status || typeof status !== 'string') return status;
  
  const mapping = type === 'repair' ? REPAIR_STATUS_ENCODE :
                  type === 'supplier' ? SUPPLIER_STATUS_ENCODE :
                  type === 'bill' ? BILL_STATUS_ENCODE : {};
  
  return mapping[status] || status;
}

/**
 * Decode status value from server format to human-readable
 * @param {string} code - The encoded status code
 * @param {string} type - Type: 'repair', 'supplier', or 'bill'
 * @returns {string} - Decoded status
 */
export function decodeStatus(code, type = 'repair') {
  if (!code) return code;

  const mapping = type === 'repair' ? REPAIR_STATUS_DECODE :
                  type === 'supplier' ? SUPPLIER_STATUS_DECODE :
                  type === 'bill' ? BILL_STATUS_DECODE : {};

  // Try several fallbacks so the decoder is tolerant of server variations
  const codeStr = String(code);
  const codeUpper = codeStr.toUpperCase();

  // 1) exact match (original case)
  if (mapping[codeStr]) return mapping[codeStr];
  // 2) uppercase match
  if (mapping[codeUpper]) return mapping[codeUpper];
  // 3) try first-character fallback (e.g. 'Re' -> 'R')
  if (codeUpper.length > 0) {
    const first = codeUpper.charAt(0);
    if (mapping[first]) return mapping[first];
  }

  return code;
}

/**
 * Normalizes status fields in API responses - decodes from server format
 * Handles both single objects and arrays of objects
 * @param {any} data - The data to normalize
 * @param {string} type - Type: 'repair', 'supplier', or 'bill'
 * @returns {any} - The normalized data
 */
export function normalizeStatusFields(data, type = 'repair') {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => normalizeStatusFields(item, type));
  }

  // Handle objects
  if (typeof data === 'object') {
    const normalized = { ...data };

    // Decode status field
    if ('status' in normalized && typeof normalized.status === 'string') {
      normalized.status = decodeStatus(normalized.status, type);
    }

    // Decode Status field (uppercase S)
    if ('Status' in normalized && typeof normalized.Status === 'string') {
      normalized.Status = decodeStatus(normalized.Status, type);
    }

    // Recursively normalize nested objects and arrays
    Object.keys(normalized).forEach(key => {
      if (normalized[key] && typeof normalized[key] === 'object') {
        normalized[key] = normalizeStatusFields(normalized[key], type);
      }
    });

    return normalized;
  }

  return data;
}

/**
 * Encodes status fields for sending to server
 * @param {any} data - The data to encode
 * @param {string} type - Type: 'repair', 'supplier', or 'bill'
 * @returns {any} - The encoded data
 */
export function encodeStatusFields(data, type = 'repair') {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => encodeStatusFields(item, type));
  }

  // Handle objects
  if (typeof data === 'object') {
    const encoded = { ...data };

    // Encode status field
    if ('status' in encoded && typeof encoded.status === 'string') {
      encoded.status = encodeStatus(encoded.status, type);
    }

    // Encode Status field (uppercase S)
    if ('Status' in encoded && typeof encoded.Status === 'string') {
      encoded.Status = encodeStatus(encoded.Status, type);
    }

    // Recursively encode nested objects and arrays
    Object.keys(encoded).forEach(key => {
      if (encoded[key] && typeof encoded[key] === 'object') {
        encoded[key] = encodeStatusFields(encoded[key], type);
      }
    });

    return encoded;
  }

  return data;
}

export default displayUserName;

