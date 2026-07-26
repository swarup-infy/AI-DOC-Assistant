// src/utils/uploadValidation.ts

/* ============================================================================
   Upload Validation Utility
   Centralized validation for all document uploads.
============================================================================ */

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".csv",
  ".xlsx",
] as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const MAX_FILE_NAME_LENGTH = 255;

export interface FileValidationResult {
  valid: boolean;
  message?: string;
}

function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return filename.substring(index).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function isSupportedExtension(filename: string): boolean {
  return ALLOWED_EXTENSIONS.includes(
    getFileExtension(filename) as (typeof ALLOWED_EXTENSIONS)[number]
  );
}

export function isSupportedMimeType(file: File): boolean {
  if (!file.type) {
    return false;
  }

  return ALLOWED_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_MIME_TYPES)[number]
  );
}

export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      message: "Please select a file.",
    };
  }

  if (!file.name.trim()) {
    return {
      valid: false,
      message: "Invalid file name.",
    };
  }

  if (file.name.length > MAX_FILE_NAME_LENGTH) {
    return {
      valid: false,
      message: `File name cannot exceed ${MAX_FILE_NAME_LENGTH} characters.`,
    };
  }

  const extensionValid = isSupportedExtension(file.name);
  const mimeValid = isSupportedMimeType(file);

  if (!extensionValid && !mimeValid) {
    return {
      valid: false,
      message:
        "Only PDF, DOCX, CSV, and XLSX files are supported.",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      message: "The selected file is empty.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: `Maximum allowed file size is ${formatFileSize(
        MAX_FILE_SIZE_BYTES
      )}.`,
    };
  }

  return {
    valid: true,
  };
}