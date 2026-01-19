/**
 * Test setup file for Vitest
 * Configures testing environment with mocks and polyfills
 */

import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock crypto.subtle for checksum tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer): Promise<ArrayBuffer> => {
        // Simple mock implementation for testing
        const array = new Uint8Array(data);
        let hash = 0;
        for (let i = 0; i < array.length; i++) {
          hash = ((hash << 5) - hash + array[i]) | 0;
        }
        const result = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          result[i] = (hash >> (i % 32)) & 0xff;
        }
        return result.buffer;
      },
    },
    getRandomValues: (array: Uint8Array): Uint8Array => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  },
});

// Mock navigator.storage for quota tests
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: vi.fn().mockResolvedValue({
      usage: 100 * 1024 * 1024, // 100MB used
      quota: 1024 * 1024 * 1024, // 1GB quota
    }),
    persist: vi.fn().mockResolvedValue(true),
    persisted: vi.fn().mockResolvedValue(false),
  },
  configurable: true,
});

// Mock navigator.onLine
let mockOnline = true;
Object.defineProperty(navigator, 'onLine', {
  get: () => mockOnline,
  configurable: true,
});

export const setMockOnline = (online: boolean) => {
  mockOnline = online;
};

// Mock window.addEventListener for online/offline events
const eventListeners: Record<string, Set<EventListener>> = {};
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = vi.fn((type: string, listener: EventListener) => {
  if (!eventListeners[type]) {
    eventListeners[type] = new Set();
  }
  eventListeners[type].add(listener);
  originalAddEventListener.call(window, type, listener);
});

window.removeEventListener = vi.fn((type: string, listener: EventListener) => {
  eventListeners[type]?.delete(listener);
  originalRemoveEventListener.call(window, type, listener);
});

export const triggerOnlineEvent = () => {
  setMockOnline(true);
  eventListeners['online']?.forEach(listener => listener(new Event('online')));
};

export const triggerOfflineEvent = () => {
  setMockOnline(false);
  eventListeners['offline']?.forEach(listener => listener(new Event('offline')));
};

// Mock Blob for size calculations
if (typeof Blob === 'undefined') {
  global.Blob = class MockBlob {
    private content: string[];
    
    constructor(content: string[]) {
      this.content = content;
    }
    
    get size(): number {
      return this.content.join('').length;
    }
  } as unknown as typeof Blob;
}

// Mock URL for file downloads
global.URL.createObjectURL = vi.fn(() => 'mock://blob-url');
global.URL.revokeObjectURL = vi.fn();

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Clean up IndexedDB after each test
afterEach(async () => {
  const databases = await indexedDB.databases?.();
  if (databases) {
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  }
});
