"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111]">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4">Something went wrong</h2>
        <button
          onClick={() => unstable_retry()}
          className="bg-white text-black px-6 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
