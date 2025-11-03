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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Your Files
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
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
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none"
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
              className="pl-10 pr-10 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            >
              {uniqueFileTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
            Loading files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
            <p className="mb-2">
              {searchQuery || filterType !== 'All Types'
                ? 'No files found matching your criteria.'
                : 'No files uploaded yet.'}
            </p>
            {!searchQuery && filterType === 'All Types' && (
              <a
                href="/dashboard"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Upload your first file
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFiles.map((file) => {
              const shareUrl = getShareUrl(file.id);
              // Estimate file size (this would ideally come from API)
              const estimatedSize = 2400 * 1024; // Placeholder - API should provide this
              
              return (
                <div
                  key={file.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {getFileIcon(file.fileType)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                          {file.name}
                        </h3>
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {file.fileType.toUpperCase()}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        <span>{formatFileSize(estimatedSize)}</span>
                        <span>Created {formatDate(file.createdAt)}</span>
                        <span>Expires {formatDate(file.expirationTime)}</span>
                      </div>

                      {/* Share Link */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="flex-1 px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopyUrl(shareUrl)}
                          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                          title="Copy link"
                        >
                          <svg
                            className="w-5 h-5"
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
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleDownload(file)}
                        className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                        title="Download"
                      >
                        <svg
                          className="w-5 h-5"
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
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
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
