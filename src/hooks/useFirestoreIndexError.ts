'use client';

export interface IndexErrorInfo {
  isIndexError: boolean;
  isPermissionError: boolean;
  message: string;
  collection?: string;
  fields?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  createIndexLink?: string;
}

export function useFirestoreIndexError() {
  const parseIndexError = (error: any, projectId: string): IndexErrorInfo => {
    const message: string = error?.message || '';
    const code: string = (error?.code || '').toString();
    const msgLower = message.toLowerCase();

    // ✅ All Firebase Firestore error codes
    const isPermissionError =
      code === 'permission-denied' ||
      code === 'PERMISSION_DENIED' ||
      msgLower.includes('missing or insufficient permissions') ||
      msgLower.includes('permission denied');

    const isIndexError =
      code === 'failed-precondition' ||
      code === 'FAILED_PRECONDITION' ||
      msgLower.includes('requires an index') ||
      msgLower.includes('missing index') ||
      msgLower.includes('composite index');

    // ✅ Network/connection errors
    const isNetworkError =
      code === 'unavailable' ||
      code === 'UNAVAILABLE' ||
      msgLower.includes('network request failed') ||
      msgLower.includes('fetch') ||
      msgLower.includes('timeout') ||
      msgLower.includes('failed to fetch');

    // ✅ Document not found
    const isNotFound =
      code === 'not-found' ||
      code === 'NOT_FOUND' ||
      msgLower.includes('no document to update') ||
      msgLower.includes('no document exists');

    // ✅ Invalid argument (bad query, field type mismatch)
    const isInvalidArgument =
      code === 'invalid-argument' ||
      code === 'INVALID_ARGUMENT' ||
      msgLower.includes('invalid argument') ||
      msgLower.includes('value for field') ||
      msgLower.includes('invalid type');

    // ✅ Resource exhausted (too many docs, quota)
    const isResourceExhausted =
      code === 'resource-exhausted' ||
      code === 'RESOURCE_EXHAUSTED' ||
      msgLower.includes('quota exceeded') ||
      msgLower.includes('too many');

    // ✅ Internal/aborted/cancelled
    const isOtherError =
      code === 'internal' ||
      code === 'INTERNAL' ||
      code === 'aborted' ||
      code === 'ABORTED' ||
      code === 'cancelled' ||
      code === 'CANCELLED' ||
      msgLower.includes('internal error') ||
      msgLower.includes('aborted');

    if (!isIndexError && !isPermissionError && !isNetworkError && !isNotFound && !isInvalidArgument && !isResourceExhausted && !isOtherError) {
      return {
        isIndexError: false,
        isPermissionError: false,
        message: message || 'Unknown error',
      };
    }

    // Index error link extraction (Firebase often includes it directly)
    let createIndexLink = '';
    const start = message.indexOf('https://console.firebase.google.com/');
    if (start >= 0) {
      createIndexLink = message.slice(start).split(/\s/)[0];
    }

    // Fallback: build common index links
    let collection = '';
    let fields: Array<{ field: string; direction: 'asc' | 'desc' }> = [];

    if (!createIndexLink && projectId) {
      // Common queries in your codebase
      if (msgLower.includes('salespersons')) {
        collection = 'salespersons';
        fields = [
          { field: 'order', direction: 'asc' },
          { field: 'createdAt', direction: 'desc' },
        ];
      } else if (msgLower.includes('reviews')) {
        collection = 'reviews';
        fields = [
          { field: 'published', direction: 'asc' }, // == true becomes asc
          { field: 'createdAt', direction: 'desc' },
        ];
      } else if (msgLower.includes('leads')) {
        collection = 'leads';
        fields = [
          { field: 'createdAt', direction: 'desc' },
        ];
      }

      if (fields.length > 0) {
        const fieldString = fields.map((f) => `${f.direction}:${f.field}`).join('|');
        createIndexLink = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=${collection}|${fieldString}`;
      }
    }

    return {
      isIndexError,
      isPermissionError,
      message: message || 'Unknown error',
      collection: collection || undefined,
      fields: fields.length ? fields : undefined,
      createIndexLink: isIndexError ? createIndexLink : '',
    };
  };

  return { parseIndexError };
}
