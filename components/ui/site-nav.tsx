import Link from "next/link";
import { Logo } from "./logo";

type SiteNavProps = {
  bordered?: boolean;
  priorityLogo?: boolean;
};

const links = [
  { href: "/ai", label: "AI" },
  { href: "/explore", label: "Explore" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteNav({ bordered = false, priorityLogo = false }: SiteNavProps) {
  return (
    <nav className={`bg-white sticky top-0 z-50 ${bordered ? "border-b border-gray-200" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo priority={priorityLogo} className="w-[60px] sm:w-[72px] md:w-[88px] lg:w-[108px]" />
            <div className="hidden md:flex items-center gap-6 text-sm">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
