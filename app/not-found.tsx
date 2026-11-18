import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[80vh] flex-col justify-center pt-28">
      <p className="eyebrow">404</p>
      <h1 className="display mt-6 text-[clamp(3rem,10vw,8rem)]">
        Nothing <em>here</em>
      </h1>
      <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--fg-2)]">That page does not exist, or it moved when the site was rebuilt.</p>
      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="link-u text-[var(--fg)]">
          Home
        </Link>
        <Link href="/#work" className="link-u text-[var(--fg)]">
          Selected work
        </Link>
        <Link href="/archive/" className="link-u text-[var(--fg)]">
          Archive
        </Link>
      </div>
    </div>
  );
}
