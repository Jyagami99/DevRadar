import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevRadar - Encontre Desenvolvedores Perto de Você",
  description:
    "Conecte-se com desenvolvedores que trabalham com as tecnologias que você tem interesse, todos em um raio de até 50km da sua localização.",
  icons: {
    icon: [
      {
        url: "favicon.svg",
        href: "favicon.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
