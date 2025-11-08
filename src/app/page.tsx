'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Lightning Fast',
      description: 'Upload files and generate shareable links in seconds. No waiting, no hassle.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Custom Expiration',
      description: 'Set your own link expiration time from 1 hour to 48 hours. Complete control.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure & Private',
      description: 'Your files are encrypted and protected. Links expire automatically for security.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      title: 'Simple Sharing',
      description: "Copy and share your link anywhere. One click and you're done.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Auto-Cleanup',
      description: 'Links automatically expire after your set time. No manual deletion needed.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your File',
      description: 'Drag and drop any file or click to browse. Supports all file types up to the size limit.',
    },
    {
      number: '02',
      title: 'Set Expiration Time',
      description: 'Choose when your link should expire. Select from quick options or set a custom duration.',
    },
    {
      number: '03',
      title: 'Share Your Link',
      description: 'Get your secure shareable link instantly. Copy and share it anywhere you want.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5 5 0 10-9.78 2.096A4 4 0 003 15z"
                />
              </svg>
              <span className="text-xl font-bold text-white">PocketCloud</span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-zinc-300 hover:text-teal-400 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-zinc-300 hover:text-teal-400 transition-colors duration-200"
              >
                How It Works
              </a>
              <button
                onClick={handleGetStarted}
                className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/50"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleGetStarted}
              className="md:hidden rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-teal-600"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          {/* Feature Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 mb-8">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-teal-400">Fast, Secure, Simple</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Share files, simply
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Upload any file and get a secure shareable link. Set your own expiration time and share with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="group flex items-center gap-2 rounded-lg bg-teal-500 px-8 py-4 text-lg font-medium text-white transition-all duration-200 hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-500/50 hover:scale-105"
            >
              Start Sharing
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-lg font-medium text-white transition-all duration-200 hover:border-teal-500 hover:bg-zinc-800 hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything you need to share files</h2>
          <p className="text-xl text-zinc-400">Built with simplicity and security in mind. Share with confidence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`relative rounded-xl border p-6 transition-all duration-300 ${
                hoveredFeature === index
                  ? 'border-teal-500 bg-zinc-900/50 shadow-lg shadow-teal-500/20 scale-105'
                  : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30">
                <div className="text-teal-400">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-zinc-400">Three simple steps to share your files securely.</p>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Step Info */}
              <div className="flex-1">
                <div className="text-6xl sm:text-7xl font-bold text-teal-500/30 mb-4">{step.number}</div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-lg text-zinc-400">{step.description}</p>
              </div>

              {/* Visual Mockup */}
              <div className="flex-1 w-full">
                <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl hover:border-teal-500/50 transition-all duration-300">
                  {index === 0 && (
                    <Image
                      src="/images/how-it-works/step-1-upload.png"
                      alt="Step 1: Upload Your File"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      priority={index === 0}
                    />
                  )}
                  {index === 1 && (
                    <Image
                      src="/images/how-it-works/step-2-expiration.png"
                      alt="Step 2: Set Expiration Time"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                    />
                  )}
                  {index === 2 && (
                    <Image
                      src="/images/how-it-works/step-3-share.png"
                      alt="Step 3: Share Your Link"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Ready to start sharing?</h2>
          <p className="text-xl text-zinc-400 mb-8">Join thousands of users who trust PocketCloud for fast, secure file sharing.</p>
          <button
            onClick={handleGetStarted}
            className="group inline-flex items-center gap-2 rounded-lg bg-teal-500 px-8 py-4 text-lg font-medium text-white transition-all duration-200 hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-500/50 hover:scale-105"
          >
            Get Started Now
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <svg className="h-6 w-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5 5 0 10-9.78 2.096A4 4 0 003 15z" />
              </svg>
              <span className="text-lg font-bold text-white">PocketCloud</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="#" className="text-zinc-400 hover:text-teal-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-zinc-400 hover:text-teal-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-zinc-400 hover:text-teal-400 transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-zinc-500">
            © 2025 PocketCloud. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
