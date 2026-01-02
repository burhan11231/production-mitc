// src/components/FirestoreErrorDialog.tsx
'use client';

import { useFirestoreIndexError, IndexErrorInfo } from '@/hooks/useFirestoreIndexError';

interface FirestoreErrorDialogProps {
  error: any;
  projectId: string;
  onDismiss: () => void;
  isOpen: boolean;
}

export default function FirestoreErrorDialog({
  error,
  projectId,
  onDismiss,
  isOpen
}: FirestoreErrorDialogProps) {
  const { parseIndexError } = useFirestoreIndexError();
  const errorInfo = parseIndexError(error, projectId);

  if (!isOpen || !error) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-red-600 flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            {errorInfo.isIndexError ? 'Composite Index Required' : 'Firestore Error'}
          </h2>
        </div>

        {/* Error Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-gray-800 text-sm break-words font-mono">
            {errorInfo.message}
          </p>
        </div>

        {/* Index Details */}
        {errorInfo.isIndexError && errorInfo.collection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span>📌</span> Index Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Collection:</label>
                <p className="text-blue-600 font-mono bg-white px-3 py-2 rounded border border-blue-200 mt-1">
                  {errorInfo.collection}
                </p>
              </div>

              {errorInfo.fields && errorInfo.fields.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Fields:</label>
                  <div className="mt-1 space-y-2">
                    {errorInfo.fields.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <p className="text-blue-600 font-mono bg-white px-3 py-2 rounded border border-blue-200 flex-1">
                          {f.field}
                        </p>
                        <span className={`px-3 py-2 rounded text-sm font-semibold ${f.direction === 'asc' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {f.direction === 'asc' ? '↑ ASC' : '↓ DESC'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Index Link Button */}
        {errorInfo.isIndexError && errorInfo.createIndexLink && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <span>✨</span> Create Index Now
            </h3>
            
            <p className="text-sm text-gray-700 mb-4">
              Click the button below to open Firebase Console and automatically create the required composite index.
            </p>

            <a
              href={errorInfo.createIndexLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-center transition-colors mb-3"
            >
              🚀 Open Firebase Console & Create Index
            </a>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
              ℹ️ <strong>Note:</strong> Index creation takes 2-5 minutes. You can close this dialog and refresh your page after creation is complete.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Dismiss
          </button>

          {errorInfo.isIndexError && errorInfo.createIndexLink && (
            <a
              href={errorInfo.createIndexLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
            >
              Create Index Now
            </a>
          )}
        </div>

        {/* Copy Error */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(errorInfo.message);
            alert('Error copied to clipboard');
          }}
          className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
        >
          📋 Copy Error Message
        </button>
      </div>
    </div>
  );
}
