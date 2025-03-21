import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans text-center">
      <div className="max-w-lg px-6">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          404
        </h1>

        <p className="text-3xl font-semibold mt-4">Oops! Page Not Found</p>

        <p className="text-lg text-gray-300 mt-4">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link href="/" passHref legacyBehavior>
          <a>
            <button className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-300">
              Back to Home
            </button>
          </a>
        </Link>
      </div>
    </div>
  );
}
