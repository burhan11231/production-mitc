'use client';

import { FirestoreError } from 'firebase/firestore';

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

    // Check if this is an index error
    const isIndexError = 
      errorMessage.includes('composite index') ||
      errorMessage.includes('missing index') ||
      (code === 'PERMISSION_DENIED' && errorMessage.includes('index'));

    if (!isIndexError) {
      return {
        isIndexError: false,
        message: errorMessage || 'Unknown error'
      };
    }

    // Extract collection from error
    let collection = '';
    const collectionMatch = errorMessage.match(/collection\s*['"]([^'"]+)['"]/i) ||
                           errorMessage.match(/in collection ['"]([^'"]+)['"]/i);
    if (collectionMatch) {
      collection = collectionMatch[1];
    }

    // Extract fields from error - look for patterns like "order, createdAt"
    let fields: Array<{ field: string; direction: 'asc' | 'desc' }> = [];
    const fieldsMatch = errorMessage.match(/fields?:\s*([^,\n]+(?:,\s*[^,\n]+)*)/i);
    if (fieldsMatch) {
      const fieldStr = fieldsMatch[1];
      // Parse field directions if specified
      const fieldPairs = fieldStr.split(',').map(f => f.trim());
      fields = fieldPairs.map((f, idx) => ({
        field: f.replace(/\s*\([^)]*\)/g, '').trim(),
        direction: idx === fieldPairs.length - 1 ? 'desc' : 'asc'
      }));
    }

    // Fallback for common index patterns
    if (!collection || fields.length === 0) {
      const commonPatterns: Record<string, { collection: string; fields: Array<{ field: string; direction: 'asc' | 'desc' }> }> = {
        salespersons: { 
          collection: 'salespersons', 
          fields: [{ field: 'order', direction: 'asc' }, { field: 'createdAt', direction: 'desc' }] 
        },
        leads: { 
          collection: 'leads', 
          fields: [{ field: 'status', direction: 'asc' }, { field: 'createdAt', direction: 'desc' }] 
        },
        reviews: { 
          collection: 'reviews', 
          fields: [{ field: 'published', direction: 'asc' }, { field: 'createdAt', direction: 'desc' }] 
        },
        siteVisits: { 
          collection: 'siteVisits', 
          fields: [{ field: 'path', direction: 'asc' }, { field: 'timestamp', direction: 'desc' }] 
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

    // Build Firebase Console index link
    let createIndexLink = '';
    if (collection && fields.length > 0 && projectId) {
      const fieldString = fields
        .map(f => \`\${f.direction === 'desc' ? 'desc' : 'asc'}:\${f.field}\`)
        .join('|');
      createIndexLink = \`https://console.firebase.google.com/project/\${projectId}/firestore/indexes?create_composite=\${collection}|\${fieldString}\`;
    }

    return {
      isIndexError: true,
      message: errorMessage,
      collection,
      fields,
      createIndexLink
    };
  };

  const buildIndexLink = (
    collection: string,
    fields: Array<{ field: string; direction: 'asc' | 'desc' }>,
    projectId: string
  ): string => {
    if (!collection || fields.length === 0 || !projectId) return '';
    const fieldString = fields
      .map(f => \`\${f.direction === 'desc' ? 'desc' : 'asc'}:\${f.field}\`)
      .join('|');
    return \`https://console.firebase.google.com/project/\${projectId}/firestore/indexes?create_composite=\${collection}|\${fieldString}\`;
  };

  return { parseIndexError, buildIndexLink };
}
