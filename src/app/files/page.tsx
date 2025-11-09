'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');

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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const responseText = await response.text();

      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html') || responseText.trim().startsWith('<')) {
        setFetchError('Received HTML instead of JSON. Please check that your API server is running at ' + API_BASE_URL);
        setFiles([]);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
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
      } else {
        setFiles([]);
        setFetchError('No files data returned from server.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError('Failed to fetch files. Please check your connection and try again.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
      setError('');
      // First get the presigned URL from our API
      const response = await fetch(`${API_BASE_URL}/api/files/${file.id}`);
      if (!response.ok) {
        setError('Failed to get download URL');
        return;
      }

      const data = await response.json();
      if (!data.presignedUrl) {
        setError('No download URL available');
        return;
      }

      // Fetch the file bytes from the presigned URL and trigger a download
      let blob: Blob | null = null;
      try {
        const fileResp = await fetch(data.presignedUrl);
        if (!fileResp.ok) {
          throw new Error('Storage response not OK');
        }

        blob = await fileResp.blob();
      } catch (fetchErr) {
        // Likely a CORS issue when fetching the presigned URL from the browser.
        // Fall back to opening the presigned URL in a new tab so the browser/storage can handle the download.
        console.warn('Presigned URL fetch failed, falling back to opening URL:', fetchErr);
        window.open(data.presignedUrl, '_blank');
        setSuccess('Opened file in new tab (fallback). If you want direct download, enable CORS on the storage bucket.');
        setTimeout(() => setSuccess(''), 5000);
        return;
      }

      if (!blob) {
        setError('Failed to download file from storage');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use the original filename if available
      a.download = file.name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Download started');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('download error', err);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }
    setError('Delete functionality not yet implemented');
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All Types' || file.fileType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const uniqueFileTypes = ['All Types', ...Array.from(new Set(files.map(f => f.fileType.toUpperCase())))];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black overflow-x-hidden">
      <Navbar />
      <div className="mx-auto w-full px-3 sm:px-4 py-3 sm:py-6">
        {/* Header */}
        <div className="mb-3 sm:mb-6 sm:text-center max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1 sm:mb-2">
            Your Files
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Manage and share your uploaded files
          </p>
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

          {/* Search and Filter */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-zinc-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer"
            >
                  {uniqueFileTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>        {/* Files List */}
        {loading ? (
          <div className="py-8 sm:py-12 text-center text-zinc-600 dark:text-zinc-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300"></div>
            <p className="mt-4">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-8 sm:py-12 text-center text-zinc-600 dark:text-zinc-400">
            <p className="mb-2 text-sm sm:text-base">
              {searchQuery || filterType !== 'All Types'
                ? 'No files found matching your criteria.'
                : 'No files uploaded yet.'}
            </p>
            {!searchQuery && filterType === 'All Types' && (
              <a
                href="/dashboard"
                className="text-sm sm:text-base text-teal-600 hover:underline dark:text-teal-400"
              >
                Upload your first file
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-2 sm:gap-3 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto">
            {filteredFiles.map((file) => {
              const shareUrl = getShareUrl(file.id);
              // Estimate file size (this would ideally come from API)
              const estimatedSize = 2400 * 1024; // Placeholder - API should provide this
              
              return (
                <div
                  key={file.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-2.5 sm:p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow w-full"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex gap-2 sm:gap-3">
                      {/* File Icon */}
                      <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        {getFileIcon(file.fileType)}
                      </div>                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start flex-row gap-2 sm:gap-3 mb-1 sm:mb-2">
                          <h3 className="text-sm sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                            {file.name}
                          </h3>
                          <span className="shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {file.fileType.toUpperCase()}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-0.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-2 sm:mb-4">
                          <span>{formatFileSize(estimatedSize)}</span>
                          <span>Created {formatDate(file.createdAt)}</span>
                          <span>Expires {formatDate(file.expirationTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Share Link and Actions */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {/* Share Link and Copy */}
                      <div className="flex items-center gap-1 min-w-0 w-full">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="w-full min-w-0 px-2 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopyUrl(shareUrl)}
                          className="shrink-0 p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Copy link"
                        >
                          <svg
                            className="w-4 h-4"
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
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 sm:flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleDownload(file)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs"
                          title="Download"
                        >
                          <svg
                            className="w-3.5 h-3.5"
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
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-xs"
                          title="Delete"
                        >
                          <svg
                            className="w-3.5 h-3.5"
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
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
