import React from 'react';

/* Catches crashes inside a page so the rest of the site keeps working,
   and shows the error instead of a blank white screen. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, prevResetKey: props.resetKey };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.prevResetKey) {
      return { error: null, prevResetKey: props.resetKey };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[page crash]', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-6 pt-[100px] font-sans text-center">
        <h1 className="text-xl font-semibold text-[#222] m-0">Something went wrong on this page</h1>
        <p className="text-sm text-[#777] max-w-lg m-0">Please refresh the page. If it keeps happening, send this message to the site admin:</p>
        <code className="text-xs bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg px-3 py-2 max-w-2xl break-words text-[#b91c1c]">
          {String(this.state.error?.message || this.state.error)}
        </code>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 rounded-lg bg-[#0b2518] text-white text-sm font-semibold border-none cursor-pointer"
        >
          Refresh page
        </button>
      </div>
    );
  }
}
