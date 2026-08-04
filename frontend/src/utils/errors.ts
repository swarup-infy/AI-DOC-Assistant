// src/utils/errors.ts

import axios, { AxiosError } from "axios";

/* ============================================================================
   Error Types
============================================================================ */

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ParsedError {
  title: string;
  message: string;
  status?: number;
  isNetworkError: boolean;
  isTimeout: boolean;
  isServerError: boolean;
  isClientError: boolean;
}

/* ============================================================================
   Default Messages
============================================================================ */

const DEFAULT_MESSAGES = {
  UNKNOWN: "Something went wrong. Please try again.",

  NETWORK:
    "Unable to connect to the server. Please check your internet connection.",

  TIMEOUT:
    "The request timed out. Please try again.",

  SERVER:
    "The server encountered an unexpected error.",

  UNAUTHORIZED:
    "You are not authorized. Please log in again.",

  FORBIDDEN:
    "You do not have permission to perform this action.",

  NOT_FOUND:
    "The requested resource could not be found.",

  VALIDATION:
    "Some information is invalid.",

  BAD_REQUEST:
    "Invalid request.",

  TOO_MANY_REQUESTS:
    "Too many requests. Please try again later.",
} as const;

/* ============================================================================
   Type Guards
============================================================================ */

export function isAxiosError(
  error: unknown
): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError(error);
}

/* ============================================================================
   Main Parser
============================================================================ */

export function parseError(error: unknown): ParsedError {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return {
        title: "Request Timeout",
        message: DEFAULT_MESSAGES.TIMEOUT,
        isNetworkError: false,
        isTimeout: true,
        isServerError: false,
        isClientError: false,
      };
    }

    if (!error.response) {
      return {
        title: "Network Error",
        message: DEFAULT_MESSAGES.NETWORK,
        isNetworkError: true,
        isTimeout: false,
        isServerError: false,
        isClientError: false,
      };
    }

    const status = error.response.status;

    const data = error.response.data;

    const backendMessage =
      data?.detail ??
      data?.message ??
      DEFAULT_MESSAGES.UNKNOWN;

    switch (status) {
      case 400:
        return {
          title: "Bad Request",
          message: backendMessage,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };

      case 401:
        return {
          title: "Unauthorized",
          message: DEFAULT_MESSAGES.UNAUTHORIZED,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };

      case 403:
        return {
          title: "Forbidden",
          message: DEFAULT_MESSAGES.FORBIDDEN,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };

      case 404:
        return {
          title: "Not Found",
          message: DEFAULT_MESSAGES.NOT_FOUND,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };

      case 422:
        return {
          title: "Validation Error",
          message: backendMessage,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };

      case 429:
        return {
          title: "Too Many Requests",
          message: DEFAULT_MESSAGES.TOO_MANY_REQUESTS,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };

      default:
        if (status >= 500) {
          return {
            title: "Server Error",
            message: DEFAULT_MESSAGES.SERVER,
            status,
            isNetworkError: false,
            isTimeout: false,
            isServerError: true,
            isClientError: false,
          };
        }

        return {
          title: "Error",
          message: backendMessage,
          status,
          isNetworkError: false,
          isTimeout: false,
          isServerError: false,
          isClientError: true,
        };
    }
  }

  if (error instanceof Error) {
    return {
      title: "Application Error",
      message: error.message,
      isNetworkError: false,
      isTimeout: false,
      isServerError: false,
      isClientError: false,
    };
  }

  return {
    title: "Unknown Error",
    message: DEFAULT_MESSAGES.UNKNOWN,
    isNetworkError: false,
    isTimeout: false,
    isServerError: false,
    isClientError: false,
  };
}

/* ============================================================================
   Simple Helper
============================================================================ */

export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_MESSAGES.UNKNOWN
): string {
  try {
    return parseError(error).message;
  } catch {
    return fallback;
  }
}

/* ============================================================================
   Logging
============================================================================ */

export function logError(
  error: unknown,
  context?: string
): void {
  if (import.meta.env.DEV) {
    console.group(
      context ? `🚨 ${context}` : "🚨 Application Error"
    );

    console.error(error);

    console.groupEnd();
  }
}
