import React from 'react';

export default function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`mt-24 pt-8 border-t border-[#eef0ee] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777777] font-sans ${className}`}>
      <p className="m-0">
        &copy; {currentYear} Wild Tuskers Sri Lanka. All rights reserved.
      </p>
      <p className="m-0 text-[#666666]">
        &copy; {currentYear}, Designed and Coded by : <span className="text-accent font-semibold">Vinsara Senanayake</span>
      </p>
    </footer>
  );
}
