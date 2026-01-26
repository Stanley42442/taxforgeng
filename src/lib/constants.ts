// Shared constants for the application

// Trial configuration
export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

// Subscription tiers
export const TIER_ORDER = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'] as const;
export type SubscriptionTierName = typeof TIER_ORDER[number];

// Rate limiting
export const CHAT_RATE_LIMIT_MS = 2000; // 2 seconds between messages
export const MAX_CHAT_MESSAGE_LENGTH = 1000;
export const MIN_CHAT_MESSAGE_LENGTH = 3;
export const MAX_CHAT_HISTORY_MESSAGES = 20;

// Storage keys
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'taxbot-chat-history',
  CHAT_POSITION: 'taxbot-position',
  REMEMBER_ME: 'taxforge-remember-me',
  TERMS_ACCEPTED: 'taxforge-terms-accepted',
  THEME: 'taxforge-ng-theme',
  NOTIFICATION_SOUND: 'notification-sound-enabled',
  NOTIFICATION_BROWSER: 'notification-browser-enabled',
} as const;

// Default values
export const DEFAULT_BORDER_RADIUS = 8;
