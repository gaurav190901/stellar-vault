import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[55vh] flex items-center justify-center text-center">
      <div className="card max-w-lg p-8">
        <p className="tag w-fit mx-auto mb-4">404</p>
        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          The requested route doesn’t exist. Return to the protocol overview to continue.
        </p>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    </section>
  );
}
