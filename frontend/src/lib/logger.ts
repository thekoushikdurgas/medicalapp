/**
 * Frontend logging utility.
 * Formats messages and prevents debug logs from polluting production builds.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = process.env.NODE_ENV !== "production";

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.debug(formatMessage("debug", message), ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(formatMessage("info", message), ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(formatMessage("warn", message), ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(formatMessage("error", message), ...args);
  },
};
