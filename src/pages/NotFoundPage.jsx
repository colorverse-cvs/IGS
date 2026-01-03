import React from "react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 md:px-15 lg:px-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
