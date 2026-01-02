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

    const isPermissionError =
      code === 'permission-denied' ||
      code === 'PERMISSION_DENIED' ||
      msgLower.includes('missing or insufficient permissions');

    const isIndexError =
      code === 'failed-precondition' ||
      code === 'FAILED_PRECONDITION' ||
      msgLower.includes('requires an index') ||
      msgLower.includes('missing index') ||
      msgLower.includes('composite index');

    if (!isIndexError && !isPermissionError) {
      return {
        isIndexError: false,
        isPermissionError: false,
        message: message || 'Unknown error',
      };
    }

    // ✅ Best: Firebase includes an actual console link in the error message sometimes
    // Example: https://console.firebase.google.com/v1/r/project/<project>/firestore/indexes?create_composite=...
    let createIndexLink = '';
    const urlMatch = message.match(/https://console.firebase.google.com/[^s]+/);
    if (urlMatch?.[0]) {
      createIndexLink = urlMatch[0];
    }

    // Fallback: build link if message didn't contain one
    let collection = '';
    let fields: Array<{ field: string; direction: 'asc' | 'desc' }> = [];

    if (!createIndexLink && projectId) {
      // Fallback to your known query (salespersons)
      collection = 'salespersons';
      fields = [
        { field: 'order', direction: 'asc' },
        { field: 'createdAt', direction: 'desc' },
      ];

      const fieldString = fields.map((f) => `${f.direction}:${f.field}`).join('|');
      createIndexLink = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=${collection}|${fieldString}`;
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