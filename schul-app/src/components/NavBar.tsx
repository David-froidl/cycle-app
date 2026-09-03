import Link from "next/link";

const LINKS = [
  { href: "/", label: "Heute" },
  { href: "/abgaben", label: "Abgaben" },
  { href: "/abend", label: "Abend" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function NavBar() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
        <span className="text-[0.95rem] font-semibold tracking-tight text-text">
          Schule
        </span>
        <nav className="flex gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-text-dim transition-colors hover:bg-surface hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
