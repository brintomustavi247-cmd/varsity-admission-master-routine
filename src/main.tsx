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
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-sky-400/30 bg-[#16206E] p-7 text-center shadow-2xl">
            <img
              src="/icons/icon-192.png"
              alt="অ্যাপ লোগো"
              className="w-16 h-16 rounded-2xl mx-auto mb-4 border border-sky-400/40 shadow-lg object-cover"
            />
            <h1 className="font-display font-extrabold text-xl text-white mb-2">
              ভার্সিটি অ্যাডমিশন রুটিন
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/80 mb-5 leading-relaxed">
              অ্যাপের নতুন ভার্সন আপডেট হয়েছে। ক্যাশ ক্লিয়ার করে পেজটি রিলোড
              করুন।
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF6B8B] to-[#F45B7A] hover:from-[#FF5C7F] hover:to-[#E8486B] text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
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
