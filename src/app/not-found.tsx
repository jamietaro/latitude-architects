import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111]">
      <div className="text-center">
        <h2 className="text-white text-xl mb-2">Page not found</h2>
        <p className="text-[#888] text-sm mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="bg-white text-black px-6 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
