"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Heute" },
  { href: "/abgaben", label: "Abgaben" },
  { href: "/abend", label: "Abend" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-5">
        <span className="text-sm font-medium text-text">Schule</span>
        <nav className="flex gap-5">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b pb-0.5 text-sm transition-colors ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-text-dim hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
