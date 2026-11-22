/**
 * @file NotFound.jsx
 * @description 404 error page displayed when a requested path is not recognized.
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Page Not Found';
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 font-sans text-center px-6 pt-[80px]">
      <p className="text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-accent">404</p>
      <h1 className="text-2xl font-semibold text-[#222222]">Page not found</h1>
      <p className="text-[#888888] max-w-md">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 mt-2 text-[0.9rem] font-medium text-accent hover:underline"
      >
        <ArrowLeft size={16} /> Back to home
      </Link>
    </div>
  );
}
