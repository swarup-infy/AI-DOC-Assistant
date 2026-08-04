// src/types/notification.ts

/* ============================================================================
   Notification Types
   Shared notification models used across the application.
============================================================================ */

/**
 * Available notification variants.
 */
export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

/**
 * Where the notification appears.
 */
export type NotificationPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Animation style.
 */
export type NotificationAnimation =
  | "fade"
  | "slide"
  | "zoom";

/**
 * Notification model.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  autoClose?: boolean;
  position?: NotificationPosition;
  animation?: NotificationAnimation;
  createdAt?: Date;
}

/**
 * State for a single notification.
 */
export interface NotificationState {
  type: NotificationType;
  text: string;
}

/**
 * Toast configuration.
 */
export interface ToastOptions {
  duration?: number;
  autoClose?: boolean;
  dismissible?: boolean;
  position?: NotificationPosition;
  animation?: NotificationAnimation;
}

/**
 * Notification service interface.
 */
export interface NotificationService {
  success(
    message: string,
    options?: ToastOptions
  ): void;

  error(
    message: string,
    options?: ToastOptions
  ): void;

  warning(
    message: string,
    options?: ToastOptions
  ): void;

  info(
    message: string,
    options?: ToastOptions
  ): void;

  remove(id: string): void;

  clear(): void;
}

/**
 * API error notification.
 */
export interface ApiNotification {
  status: number;
  message: string;
  timestamp?: string;
}

/**
 * Upload notification.
 */
export interface UploadNotification {
  filename: string;
  progress: number;
  completed: boolean;
  error?: string;
}
