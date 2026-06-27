import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="text-center relative z-10">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[56px]">search</span>
        </div>
        <h1 className="text-[96px] font-bold text-primary leading-none mb-2 select-none">404</h1>
        <p className="text-display-lg font-display-lg text-on-surface mb-2">Page not found</p>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-sm mx-auto mb-lg">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-primary text-on-surface rounded-xl font-body-bold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined mr-2">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
