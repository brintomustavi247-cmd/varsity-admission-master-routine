import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically handle Vite dynamic import / chunk errors
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    console.warn('Vite preload error detected. Reloading page...');
    window.location.reload();
  });
}

// Register PWA service worker and ensure updates are applied
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Check for updates immediately
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('PWA service worker registration skipped:', err);
      });
  });
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  handleReset = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
    } catch {
      // Ignore cleanup error
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B19] text-white flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-cyan-400/40 bg-[#0A1024] p-7 text-center shadow-[0_0_40px_rgba(0,240,255,0.2)]">
            <img
              src="/icons/icon-192.png"
              alt="অ্যাপ লোগো"
              className="w-20 h-20 rounded-2xl mx-auto mb-4 border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.4)] object-cover"
            />
            <h1 className="font-display font-extrabold text-xl text-white mb-2">
              ভার্সিটি অ্যাডমিশন রুটিন
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/80 mb-5 leading-relaxed">
              অ্যাপের নতুন ভার্সন আপডেট হয়েছে। ক্যাশ ক্লিয়ার করে পেজটি রিলোড
              করুন।
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(255,23,68,0.4)] transition-all cursor-pointer font-aura tracking-wide"
            >
              🔄 ক্যাশ ক্লিয়ার ও রিলোড করুন
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
