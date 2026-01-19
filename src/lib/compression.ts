import LZString from 'lz-string';

export interface CompressionResult {
  compressed: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface DecompressionResult<T> {
  data: T;
  wasCompressed: boolean;
}

/**
 * Compress data for IndexedDB storage using lz-string
 * Typically achieves 50-70% size reduction for JSON data
 */
export const compressData = <T>(data: T): CompressionResult => {
  const jsonString = JSON.stringify(data);
  const originalSize = new Blob([jsonString]).size;
  
  // Use UTF-16 compression for better IndexedDB compatibility
  const compressed = LZString.compressToUTF16(jsonString);
  const compressedSize = new Blob([compressed]).size;
  
  return {
    compressed,
    originalSize,
    compressedSize,
    compressionRatio: originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0,
  };
};

/**
 * Decompress data from IndexedDB storage
 */
export const decompressData = <T>(compressed: string): T => {
  const jsonString = LZString.decompressFromUTF16(compressed);
  if (!jsonString) {
    throw new Error('Failed to decompress data - data may be corrupted');
  }
  return JSON.parse(jsonString) as T;
};

/**
 * Check if data appears to be compressed
 */
export const isCompressed = (data: unknown): boolean => {
  if (typeof data !== 'string') return false;
  // Compressed UTF-16 strings have specific characteristics
  try {
    const decompressed = LZString.decompressFromUTF16(data);
    return decompressed !== null && decompressed !== '';
  } catch {
    return false;
  }
};

/**
 * Get the size of data in bytes
 */
export const getDataSize = (data: unknown): number => {
  if (typeof data === 'string') {
    return new Blob([data]).size;
  }
  return new Blob([JSON.stringify(data)]).size;
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Compress multiple items efficiently
 */
export const compressBatch = <T>(items: T[]): CompressionResult => {
  return compressData(items);
};

/**
 * Estimate compression savings for given data
 */
export const estimateCompressionSavings = <T>(data: T): {
  originalSize: number;
  estimatedCompressedSize: number;
  estimatedSavings: number;
  savingsPercent: number;
} => {
  const result = compressData(data);
  return {
    originalSize: result.originalSize,
    estimatedCompressedSize: result.compressedSize,
    estimatedSavings: result.originalSize - result.compressedSize,
    savingsPercent: result.compressionRatio,
  };
};
