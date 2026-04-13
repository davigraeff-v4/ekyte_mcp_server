/**
 * Ekyte MCP Server Constants
 */

// Single base URL for all Ekyte API requests
export const EKYTE_BASE_URL = "https://api.ekyte.com";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 100;
export const USERS_PAGE_SIZE = 500;

// Response limits
export const CHARACTER_LIMIT = 25000;

// Request timeouts (ms)
export const REQUEST_TIMEOUT = 30000;

// Task status mapping
export const TASK_STATUS = {
  ACTIVE: 10,
  PAUSED: 20,
  COMPLETED: 30,
  CANCELLED: 40,
} as const;

export const TASK_STATUS_LABELS: Record<number, string> = {
  10: "Ativa",
  20: "Pausada",
  30: "Concluída",
  40: "Cancelada",
};

// Time tracking types
export const TIME_TRACKING_TYPE = {
  WITH_TASK: 1,
  WITHOUT_TASK: 2,
} as const;
