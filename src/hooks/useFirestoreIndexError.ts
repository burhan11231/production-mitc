// src/hooks/useFirestoreIndexError.ts
'use client';

export interface IndexErrorInfo {
  isIndexError: boolean;
  message: string;
  collection?: string;
  fields?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  createIndexLink?: string;
}

export function useFirestoreIndexError() {
  const parseIndexError = (error: any, projectId: string): IndexErrorInfo => {
    const errorMessage = error?.message || '';
    const code = error?.code || '';

    // Detect index error
    const isIndexError =
      errorMessage.includes('composite index') ||
      errorMessage.includes('missing index') ||
      errorMessage.includes('index') ||
      code === 'failed-precondition' ||
      code === 'FAILED_PRECONDITION' ||
      (code === 'PERMISSION_DENIED' && errorMessage.includes('index'));

    if (!isIndexError) {
      return {
        isIndexError: false,
        message: errorMessage || 'Unknown error',
      };
    }

    // Extract collection - PROPER REGEX WITH CAPTURE GROUP
    let collection = '';
    const collectionMatch =
      errorMessage.match(/collection\s+['"`]([^'"`]+)['"`]/i) ||
      errorMessage.match(/in\s+collection\s+['"`]([^'"`]+)['"`]/i) ||
      errorMessage.match(/on\s+collection\s+['"`]([^'"`]+)['"`]/i) ||
      errorMessage.match(/for\s+collection\s+['"`]([^'"`]+)['"`]/i);

    if (collectionMatch && collectionMatch[1]) {
      collection = collectionMatch[1];
    }

    // Extract fields
    let fields: Array<{ field: string; direction: 'asc' | 'desc' }> = [];
    const fieldsMatch = errorMessage.match(/fields?:\s*([^.\n]+)/i);
    if (fieldsMatch) {
      const fieldStr = fieldsMatch[1];
      const fieldPairs = fieldStr.split(',').map((f: string) => f.trim());
      fields = fieldPairs.map((f: string, idx: number) => ({
        field: f.replace(/\s*\([^)]*\)/g, '').trim(),
        direction: idx === fieldPairs.length - 1 ? 'desc' : 'asc',
      }));
    }

    // Fallback patterns for known collections
    if (!collection || fields.length === 0) {
      const commonPatterns: Record<
        string,
        {
          collection: string;
          fields: Array<{ field: string; direction: 'asc' | 'desc' }>;
        }
      > = {
        salespersons: {
          collection: 'salespersons',
          fields: [
            { field: 'order', direction: 'asc' },
            { field: 'createdAt', direction: 'desc' },
          ],
        },
        leads: {
          collection: 'leads',
          fields: [
            { field: 'status', direction: 'asc' },
            { field: 'createdAt', direction: 'desc' },
          ],
        },
      };

      for (const [key, pattern] of Object.entries(commonPatterns)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
          collection = pattern.collection;
          fields = pattern.fields;
          break;
        }
      }
    }

    // Build Firebase link
    let createIndexLink = '';
    if (collection && fields.length > 0 && projectId) {
      const fieldString = fields
        .map((f) => `${f.direction}:${f.field}`)
        .join('|');
      createIndexLink = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=${collection}|${fieldString}`;
    }

    return {
      isIndexError: true,
      message: errorMessage,
      collection,
      fields,
      createIndexLink,
    };
  };

  const buildIndexLink = (
    collection: string,
    fields: Array<{ field: string; direction: 'asc' | 'desc' }>,
    projectId: string
  ): string => {
    if (!collection || fields.length === 0 || !projectId) return '';
    const fieldString = fields
      .map((f) => `${f.direction}:${f.field}`)
      .join('|');
    return `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=${collection}|${fieldString}`;
  };

  return { parseIndexError, buildIndexLink };
}
