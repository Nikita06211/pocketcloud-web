'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
interface UploadResponse {
  message: string;
  fileId: string;
  fileName: string;
  fileType: string;
  expiresAt: string;
  uploadUrl: string;
}

type ViewState = 'upload' | 'file-selected' | 'link-generated';

export default function DashboardPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [shareableUrl, setShareableUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedHours, setSelectedHours] = useState(24);
  const [fileId, setFileId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too big');
      return;
    }

    setSelectedFile(file);
    setViewState('file-selected');
    setError('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too big');
      return;
    }

    setSelectedFile(file);
    setViewState('file-selected');
    setError('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setViewState('upload');
    setError('');
    if (document.getElementById('file-input') as HTMLInputElement) {
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleGenerateLink = async () => {
    if (!selectedFile) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Read file as binary
      const fileData = await selectedFile.arrayBuffer();

      // Build query parameters
      const params = new URLSearchParams();
      params.append('fileName', selectedFile.name);
      
      // Auto-detect file type
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      let fileType = 'txt';
      if (extension === 'pdf') {
        fileType = 'pdf';
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
        fileType = 'jpg';
      }
      params.append('fileType', fileType);
      params.append('expirationHours', selectedHours.toString());

      const response = await fetch(
        `${API_BASE_URL}/api/upload?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
          },
          body: fileData,
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          setError('API server returned HTML instead of JSON. Please check your API server.');
        } else {
          setError(`Unexpected response format (${contentType}). Expected JSON.`);
        }
        setUploading(false);
        return;
      }

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        setError(data.message || 'Upload failed');
        setUploading(false);
        return;
      }

      // Success
      const url = `${window.location.origin}/files/${data.fileId}`;
      setShareableUrl(url);
      setExpiresAt(data.expiresAt);
      setFileId(data.fileId);
      setViewState('link-generated');
    } catch (err) {
      setError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
      const copyBtn = document.getElementById('copy-btn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy';
        }, 2000);
      }
    });
  };

  const openLink = () => {
    window.open(shareableUrl, '_blank');
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const resetFlow = () => {
    setSelectedFile(null);
    setShareableUrl('');
    setExpiresAt('');
    setFileId('');
    setViewState('upload');
    setSelectedHours(24);
    if (document.getElementById('file-input') as HTMLInputElement) {
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 sm:mb-3">
            Share files, simply
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Upload any file and get a secure shareable link. Set your own expiration time.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-4 sm:p-8 shadow-lg dark:bg-zinc-900">
          {error && (
            <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              {error}
            </div>
          )}

          {/* Upload View */}
          {viewState === 'upload' && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-zinc-300 rounded-xl p-12 text-center cursor-pointer hover:border-zinc-400 transition-colors dark:border-zinc-700 dark:hover:border-zinc-600"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-zinc-600 dark:text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Drop your file here
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      or click to browse
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Selected View */}
          {viewState === 'file-selected' && selectedFile && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate text-sm sm:text-base">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1.5 sm:p-2"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Expiration Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Link expires in
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-3">
                  {[1, 6, 12, 24, 48].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setSelectedHours(hours)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedHours === hours
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={selectedHours}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setSelectedHours(value);
                      } else if (e.target.value === '') {
                        setSelectedHours(1);
                      }
                    }}
                    placeholder="Custom hours"
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">hours</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateLink}
                disabled={uploading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          )}

          {/* Link Generated View */}
          {viewState === 'link-generated' && shareableUrl && (
            <div className="space-y-6">
              {/* File Info */}
              {selectedFile && (
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              )}

              {/* Shareable Link Section */}
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
                  Your shareable link
                </p>
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 mb-3"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Expires in <span className="font-semibold text-zinc-900 dark:text-zinc-50">{expiresAt ? formatTimeRemaining(expiresAt) : ''}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={openLink}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </button>
                    <button
                      id="copy-btn"
                      onClick={() => copyToClipboard(shareableUrl)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Share Another File Button */}
              <button
                onClick={resetFlow}
                className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Share Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
