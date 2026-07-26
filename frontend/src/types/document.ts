// src/types/document.ts

/* ============================================================================
   Document Types
   Shared interfaces used across the application.
============================================================================ */

/**
 * Main document model returned by the backend.
 */
export interface AppDocument {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  file_path?: string;
  uploaded_at: string;
  updated_at?: string;
}

/**
 * Response after uploading a document.
 */
export interface UploadDocumentResponse {
  message: string;
  document: AppDocument;
}

/**
 * Response when fetching all documents.
 */
export interface GetDocumentsResponse {
  documents: AppDocument[];
}

/**
 * Response after deleting a document.
 */
export interface DeleteDocumentResponse {
  message: string;
}

/**
 * Response after updating document metadata.
 */
export interface UpdateDocumentResponse {
  message: string;
  document: AppDocument;
}

/**
 * Search result.
 */
export interface SearchDocumentResult {
  document_id: number;
  filename: string;
  score: number;
  snippet: string;
}

/**
 * Semantic search response.
 */
export interface SearchDocumentsResponse {
  results: SearchDocumentResult[];
}

/**
 * Document summary.
 */
export interface DocumentSummary {
  document_id: number;
  summary: string;
}

/**
 * AI Question Answering.
 */
export interface DocumentAnswer {
  answer: string;
  sources?: string[];
}

/**
 * Upload progress.
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * File validation.
 */
export interface FileValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Supported document types.
 */
export type SupportedFileType =
  | "pdf"
  | "docx"
  | "csv"
  | "xlsx";

/**
 * Sort options.
 */
export type DocumentSortField =
  | "filename"
  | "uploaded_at"
  | "file_size";

export type SortDirection =
  | "asc"
  | "desc";

/**
 * Filter object.
 */
export interface DocumentFilter {
  search?: string;
  fileType?: SupportedFileType;
  sortBy?: DocumentSortField;
  direction?: SortDirection;
}

/**
 * Pagination.
 */
export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}