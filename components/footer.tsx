import { SOCIAL_LINKS } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted">
          © {year} Vidhun Vijayakumar Suja
        </p>
        <ul className="flex items-center gap-6">
          <li>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted transition-colors hover:text-text"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted transition-colors hover:text-text"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
