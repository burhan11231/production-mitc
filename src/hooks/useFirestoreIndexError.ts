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

    const isPermissionError =
      code === 'permission-denied' ||
      code === 'PERMISSION_DENIED' ||
      message.toLowerCase().includes('missing or insufficient permissions');

    const isIndexError =
      code === 'failed-precondition' ||
      code === 'FAILED_PRECONDITION' ||
      message.toLowerCase().includes('requires an index') ||
      message.toLowerCase().includes('missing index') ||
      message.toLowerCase().includes('composite index');

    // If neither, return basic
    if (!isIndexError && !isPermissionError) {
      return {
        isIndexError: false,
        isPermissionError: false,
        message: message || 'Unknown error',
      };
    }

    // Default to known query for salespersons
    // Because Firebase error messages differ between environments
    const collection = 'salespersons';
    const fields: Array<{ field: string; direction: 'asc' | 'desc' }> = [
      { field: 'order', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' },
    ];

    let createIndexLink = '';
    if (projectId) {
      const fieldString = fields.map((f) => `${f.direction}:${f.field}`).join('|');
      createIndexLink = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=${collection}|${fieldString}`;
    }

    return {
      isIndexError,
      isPermissionError,
      message: message || 'Unknown error',
      collection,
      fields,
      createIndexLink: isIndexError ? createIndexLink : '',
    };
  };

  return { parseIndexError };
}