import React from "react";
import { HiExclamationTriangle, HiArrowPath } from "react-icons/hi2";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Global Application Error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 px-6 py-24 transition-colors">
          <div className="max-w-md w-full text-center bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-8 sm:p-12 rounded-3xl shadow-xl">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600 dark:text-rose-400">
              <HiExclamationTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-serif font-light mb-3 tracking-wide">
              Something Went Wrong
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-8 leading-relaxed">
              An unexpected error occurred while processing your request. Please reload the page or return to our homepage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-medium uppercase tracking-[0.15em] hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm cursor-pointer"
              >
                <HiArrowPath className="w-4 h-4 mr-2" /> Reload Page
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium uppercase tracking-[0.15em] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
