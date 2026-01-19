/**
 * Data Integrity utilities for offline storage
 * Provides checksum generation, validation, and auto-repair
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RepairResult<T> {
  data: T;
  wasRepaired: boolean;
  repairs: string[];
}

export interface IntegrityResult {
  checksumValid: boolean;
  schemaValid: boolean;
  canRepair: boolean;
  needsRefetch: boolean;
  errors: string[];
}

export interface IntegrityReport {
  totalRecords: number;
  validRecords: number;
  repairedRecords: number;
  corruptedRecords: number;
  quarantinedRecords: number;
  refetchNeeded: string[];
  timestamp: Date;
}

export interface IntegrityLog {
  id: string;
  table: string;
  action: 'verified' | 'repaired' | 'quarantined' | 'refetched';
  details: string;
  timestamp: number;
}

interface SchemaDefinition {
  required: string[];
  types: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>;
  defaults: Record<string, unknown>;
}

// Schema definitions for all cacheable data types
export const SCHEMAS: Record<string, SchemaDefinition> = {
  business: {
    required: ['id', 'user_id', 'name'],
    types: { 
      id: 'string', 
      user_id: 'string',
      name: 'string',
      turnover: 'number',
      entity_type: 'string',
    },
    defaults: { 
      turnover: 0, 
      entity_type: 'sole_proprietorship',
      cac_verified: false,
    },
  },
  expense: {
    required: ['id', 'user_id', 'amount', 'category'],
    types: { 
      id: 'string', 
      user_id: 'string',
      amount: 'number', 
      category: 'string',
      type: 'string',
    },
    defaults: { 
      amount: 0, 
      is_deductible: true,
      type: 'expense',
    },
  },
  calculation: {
    required: ['id', 'inputs', 'result', 'created_at'],
    types: { 
      id: 'string', 
      inputs: 'object', 
      result: 'object',
      created_at: 'string',
    },
    defaults: {},
  },
  personalExpense: {
    required: ['id', 'user_id', 'category', 'amount'],
    types: { 
      id: 'string', 
      user_id: 'string',
      amount: 'number', 
      category: 'string',
    },
    defaults: { 
      amount: 0,
      payment_interval: 'monthly',
      is_active: true,
    },
  },
};

/**
 * Generate SHA-256 checksum for data using Web Crypto API
 */
export const generateChecksum = async (data: unknown): Promise<string> => {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify that a checksum matches the data
 */
export const verifyChecksum = async (data: unknown, storedChecksum: string): Promise<boolean> => {
  const currentChecksum = await generateChecksum(data);
  return currentChecksum === storedChecksum;
};

/**
 * Validate data against its schema
 */
export const validateSchema = (data: unknown, schemaName: string): ValidationResult => {
  const schema = SCHEMAS[schemaName];
  if (!schema) {
    return { isValid: false, errors: [`Unknown schema: ${schemaName}`], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const record = data as Record<string, unknown>;

  // Check required fields
  for (const field of schema.required) {
    if (record[field] === undefined || record[field] === null) {
      if (schema.defaults[field] !== undefined) {
        warnings.push(`Missing required field '${field}' - can be repaired with default`);
      } else {
        errors.push(`Missing required field '${field}'`);
      }
    }
  }

  // Check types
  for (const [field, expectedType] of Object.entries(schema.types)) {
    const value = record[field];
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expectedType) {
        if (canCoerceType(value, expectedType)) {
          warnings.push(`Field '${field}' has wrong type (${actualType} instead of ${expectedType}) - can be repaired`);
        } else {
          errors.push(`Field '${field}' has wrong type: expected ${expectedType}, got ${actualType}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Check if a value can be coerced to the expected type
 */
const canCoerceType = (value: unknown, expectedType: string): boolean => {
  switch (expectedType) {
    case 'number':
      return !isNaN(Number(value));
    case 'string':
      return true; // Anything can be stringified
    case 'boolean':
      return ['true', 'false', '1', '0', 1, 0].includes(value as string | number);
    default:
      return false;
  }
};

/**
 * Repair data by applying defaults and fixing types
 */
export const repairData = (
  data: Record<string, unknown>, 
  schemaName: string
): RepairResult<Record<string, unknown>> => {
  const schema = SCHEMAS[schemaName];
  if (!schema) {
    return { data, wasRepaired: false, repairs: [] };
  }

  const repairs: string[] = [];
  const repairedData: Record<string, unknown> = { ...data };

  // Apply defaults for missing required fields
  for (const field of schema.required) {
    if ((repairedData[field] === undefined || repairedData[field] === null) && 
        schema.defaults[field] !== undefined) {
      repairedData[field] = schema.defaults[field];
      repairs.push(`Applied default value for '${field}'`);
    }
  }

  // Apply defaults for optional fields
  for (const [field, defaultValue] of Object.entries(schema.defaults)) {
    if (repairedData[field] === undefined) {
      repairedData[field] = defaultValue;
      repairs.push(`Applied default value for optional field '${field}'`);
    }
  }

  // Coerce types where possible
  for (const [field, expectedType] of Object.entries(schema.types)) {
    const value = repairedData[field];
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expectedType && canCoerceType(value, expectedType)) {
        repairedData[field] = coerceType(value, expectedType);
        repairs.push(`Coerced '${field}' from ${actualType} to ${expectedType}`);
      }
    }
  }

  return {
    data: repairedData,
    wasRepaired: repairs.length > 0,
    repairs,
  };
};

/**
 * Coerce a value to the expected type
 */
const coerceType = (value: unknown, expectedType: string): unknown => {
  switch (expectedType) {
    case 'number':
      return Number(value);
    case 'string':
      return String(value);
    case 'boolean':
      return ['true', '1', 1].includes(value as string | number);
    default:
      return value;
  }
};

/**
 * Perform a full integrity check on a record
 */
export const checkIntegrity = async (
  data: unknown,
  storedChecksum: string,
  schemaName: string
): Promise<IntegrityResult> => {
  const errors: string[] = [];
  
  // Verify checksum
  const checksumValid = await verifyChecksum(data, storedChecksum);
  if (!checksumValid) {
    errors.push('Checksum mismatch - data may be corrupted');
  }

  // Validate schema
  const schemaResult = validateSchema(data, schemaName);
  
  // Determine if data can be repaired
  const canRepair = schemaResult.warnings.length > 0 && schemaResult.errors.length === 0;
  
  // Determine if refetch is needed
  const needsRefetch = !checksumValid || schemaResult.errors.length > 0;

  return {
    checksumValid,
    schemaValid: schemaResult.isValid,
    canRepair,
    needsRefetch,
    errors: [...errors, ...schemaResult.errors],
  };
};

/**
 * Create an empty integrity report
 */
export const createEmptyReport = (): IntegrityReport => ({
  totalRecords: 0,
  validRecords: 0,
  repairedRecords: 0,
  corruptedRecords: 0,
  quarantinedRecords: 0,
  refetchNeeded: [],
  timestamp: new Date(),
});

/**
 * Generate a unique ID for integrity logs
 */
export const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
