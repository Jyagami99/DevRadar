"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DebugClient() {
  const { data: session, status } = useSession();

  return (
    <div className="mt-6 bg-gray-100 p-4 rounded-md">
      <h2 className="text-lg font-medium mb-2">
        Status de Autenticação do Cliente
      </h2>

      {status === "loading" ? (
        <div>Carregando...</div>
      ) : status === "authenticated" ? (
        <div className="bg-green-100 p-4 rounded-md">
          <p className="font-medium">Conectado como {session.user?.name}</p>
          <p className="text-sm text-gray-600 mb-2">
            Email: {session.user?.email}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sair
          </Button>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="mb-2">Não conectado</p>
          <Button variant="outline" size="sm" onClick={() => signIn("github")}>
            Entrar com GitHub
          </Button>
        </div>
      )}
    </div>
  );
}
