'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface FileData {
  id: string;
  name: string;
  fileType: string;
  createdAt: string;
  expirationTime: string;
}

export default function FileViewPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [presignedUrl, setPresignedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (fileId) {
      fetchFile();
    }
  }, [fileId]);

  const handleDownload = async () => {
    if (!presignedUrl || !fileData) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);

      const response = await fetch(presignedUrl);
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength ?? '0', 10);
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Failed to initialize download');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        if (total) {
          setDownloadProgress(Math.round((receivedLength / total) * 100));
        }
      }

      // Combine all chunks into a single Uint8Array
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Create blob and download
      const blob = new Blob([chunksAll]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloading(false);
      setDownloadProgress(0);
    } catch (err) {
      setError('Failed to download file');
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const fetchFile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('File not found');
        } else if (response.status === 410) {
          setError('This file has expired');
        } else {
          setError(data.message || 'Failed to load file');
        }
        setLoading(false);
        return;
      }

      setFileData(data.file);
      setPresignedUrl(data.presignedUrl);
    } catch (err) {
      setError('An error occurred while loading the file');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-zinc-600 dark:text-zinc-400">
            Loading file...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-3 sm:px-4 dark:bg-black">
        <div className="w-full max-w-md rounded-lg bg-white p-6 sm:p-8 shadow-lg dark:bg-zinc-900">
          <div className="text-center">
            <div className="mb-4 text-xl sm:text-2xl">⚠️</div>
            <h2 className="mb-2 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50">
              Error
            </h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">{error}</p>
            <a
              href="/"
              className="inline-block w-full sm:w-auto rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isImage = fileData?.fileType === 'jpg' || fileData?.fileType === 'png' || fileData?.fileType === 'gif';
  const isPDF = fileData?.fileType === 'pdf';

  return (
    <div className="min-h-screen bg-zinc-50 px-3 sm:px-4 py-4 sm:py-8 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        {/* File Info Header */}
        <div className="mb-4 sm:mb-6 rounded-lg bg-white p-4 sm:p-6 shadow-lg dark:bg-zinc-900">
          <h1 className="mb-2 text-xl sm:text-2xl font-bold text-black dark:text-zinc-50 break-words">
            {fileData?.name}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>
              Type: <span className="font-medium">{fileData?.fileType.toUpperCase()}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Expires: <span className="font-medium">{fileData?.expirationTime ? new Date(fileData.expirationTime).toLocaleString() : 'N/A'}</span>
            </span>
          </div>
        </div>

        {/* File Display */}
        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-lg dark:bg-zinc-900">
          {isImage && presignedUrl ? (
            <div className="flex justify-center">
              <img
                src={presignedUrl}
                alt={fileData?.name}
                className="max-h-[50vh] sm:max-h-[80vh] w-full object-contain rounded-lg"
              />
            </div>
          ) : isPDF && presignedUrl ? (
            <div className="h-[50vh] sm:h-[80vh]">
              <iframe
                src={presignedUrl}
                className="h-full w-full rounded-lg"
                title={fileData?.name}
              />
            </div>
          ) : presignedUrl ? (
            <div className="text-center space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-block w-full sm:w-auto rounded-md bg-black px-4 sm:px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? 'Downloading...' : 'Download File'}
              </button>
              {downloading && (
                <div className="w-full max-w-xs mx-auto space-y-2">
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300 ease-in-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {downloadProgress}%
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 sm:py-8 text-center text-zinc-600 dark:text-zinc-400">
              Unable to load file
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
