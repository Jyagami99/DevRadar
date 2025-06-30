"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const baseLinks = [
    { href: "/", label: "Início" },
    { href: "/search", label: "Buscar Devs" },
  ];

  const conditionalLinks = [];

  if (status === "authenticated" && session) {
    conditionalLinks.push({ href: "/profile", label: "Perfil" })
  } else if (status === "unauthenticated") {
    conditionalLinks.push({ href: "/register", label: "Cadastrar" })
  }

  const debugLinks = [];
  if (process.env.NODE_ENV === "development") {
    debugLinks.push({ href: "/debug", label: "Debug" });
  }

  // const allLinks = [...baseLinks, ...conditionalLinks, ...debugLinks];
  const allLinks = [...baseLinks, ...conditionalLinks];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {allLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}

      {status === "loading" && (
        <span className="text-sm text-muted-foreground animate-pulse">
          Carregando...
        </span>
      )}
    </nav>
  );
}
