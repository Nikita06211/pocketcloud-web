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

  useEffect(() => {
    if (fileId) {
      fetchFile();
    }
  }, [fileId]);

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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
          <div className="text-center">
            <div className="mb-4 text-2xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-black dark:text-zinc-50">
              Error
            </h2>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">{error}</p>
            <a
              href="/"
              className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
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
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        {/* File Info Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
          <h1 className="mb-2 text-2xl font-bold text-black dark:text-zinc-50">
            {fileData?.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>
              Type: <span className="font-medium">{fileData?.fileType.toUpperCase()}</span>
            </span>
            <span>
              Expires: <span className="font-medium">{fileData?.expirationTime ? new Date(fileData.expirationTime).toLocaleString() : 'N/A'}</span>
            </span>
          </div>
        </div>

        {/* File Display */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
          {isImage && presignedUrl ? (
            <div className="flex justify-center">
              <img
                src={presignedUrl}
                alt={fileData?.name}
                className="max-h-[80vh] max-w-full rounded-lg"
              />
            </div>
          ) : isPDF && presignedUrl ? (
            <div className="h-[80vh]">
              <iframe
                src={presignedUrl}
                className="h-full w-full rounded-lg"
                title={fileData?.name}
              />
            </div>
          ) : presignedUrl ? (
            <div className="text-center">
              <a
                href={presignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Download File
              </a>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
              Unable to load file
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
