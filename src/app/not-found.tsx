import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface-container rounded-lg border border-outline-variant/30 p-8 max-w-md w-full flex flex-col items-center gap-4">
        <h2 className="font-headline-sm text-lg text-on-surface font-semibold">
          Page Not Found
        </h2>
        <p className="font-body-sm text-outline text-xs">
          The requested workspace resource or page could not be located.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary-container hover:bg-[#ff771a] text-white font-medium rounded font-label-md text-xs transition shadow-sm"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
