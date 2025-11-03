'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const API_BASE_URL = 'http://localhost:3002';

interface FileItem {
  id: string;
  name: string;
  fileType: string;
  createdAt: string;
  expirationTime: string;
  presignedUrl?: string;
}

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copyingFileId, setCopyingFileId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchFiles();
  }, [router]);

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setFetchError('');
      const url = `${API_BASE_URL}/api/files`;
      console.log('Fetching files from:', url);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      console.log('Response Content-Type:', response.headers.get('content-type'));

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      // Get response text first to check if it's HTML
      const responseText = await response.text();
      console.log('Response text (first 200 chars):', responseText.substring(0, 200));

      // Check if response is HTML (ngrok warning page)
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html') || responseText.trim().startsWith('<')) {
        setFetchError('Received HTML instead of JSON. Please check that your API server is running at ' + API_BASE_URL);
        setFiles([]);
        setLoading(false);
        return;
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        setFetchError(`Failed to parse response as JSON. Response starts with: ${responseText.substring(0, 100)}`);
        setFiles([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setFetchError(data.message || `Failed to fetch files (${response.status})`);
        setFiles([]);
        setLoading(false);
        return;
      }

      if (data.files && Array.isArray(data.files)) {
        setFiles(data.files);
        setFetchError('');
        console.log('Successfully loaded', data.files.length, 'files');
        console.log('First file data:', data.files[0]);
      } else {
        setFiles([]);
        setFetchError('No files data returned from server. Response: ' + JSON.stringify(data).substring(0, 200));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      const errorMessage = err instanceof SyntaxError && err.message.includes('JSON')
        ? 'Server returned invalid JSON. This might be an ngrok warning page or server error.'
        : 'Failed to fetch files. Please check your connection and try again.';
      setFetchError(errorMessage);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPresignedUrl = async (fileId: string, existingPresignedUrl?: string) => {
    // If presigned URL is already available in the file data, use it directly
    if (existingPresignedUrl) {
      await navigator.clipboard.writeText(existingPresignedUrl);
      setSuccess('Presigned URL copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    // Otherwise, fetch it from the API
    setCopyingFileId(fileId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to get file URL');
        setCopyingFileId(null);
        return;
      }

      const data = await response.json();
      if (data.presignedUrl) {
        await navigator.clipboard.writeText(data.presignedUrl);
        setSuccess('Presigned URL copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('No presigned URL found in response');
      }
    } catch (err) {
      console.error('Error fetching presigned URL:', err);
      setError('Failed to fetch presigned URL');
    } finally {
      setCopyingFileId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getShareUrl = (fileId: string) => {
    return `${window.location.origin}/files/${fileId}`;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setSuccess('URL copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    });
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/${file.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.presignedUrl) {
          window.open(data.presignedUrl, '_blank');
        } else {
          setError('No download URL available');
        }
      }
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }
    // Note: Delete endpoint would need to be implemented on the backend
    setError('Delete functionality not yet implemented');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
              Your Files
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Manage and share your uploaded files
            </p>
          </div>
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Messages */}
        {fetchError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {fetchError}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Files List */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            All Files ({files.length})
          </h2>

          {loading ? (
            <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
              Loading files...
            </div>
          ) : files.length === 0 && !fetchError ? (
            <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
              <p className="mb-2">No files uploaded yet.</p>
              <a
                href="/dashboard"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Upload your first file
              </a>
            </div>
          ) : files.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Share URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {files.map((file) => {
                    const shareUrl = getShareUrl(file.id);
                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-black dark:text-zinc-50">
                          {file.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800">
                            {file.fileType.toUpperCase()}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {formatDate(file.expirationTime)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <button
                            onClick={() => handleCopyUrl(shareUrl)}
                            className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            <span className="max-w-[200px] truncate">{shareUrl}</span>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDownload(file)}
                              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                              title="Download"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
