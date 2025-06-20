"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/register" });
    } catch (error) {
      console.error("Erro no login:", error)
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bem-vindo ao DevRadar</CardTitle>
          <CardDescription>Entre com GitHub para continuar</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full max-w-xs bg-black hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <img src={"/github-white.svg"} className="mr-2 h-4 w-4" />
                Entrar com GitHub
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Não quer entrar?{" "}
            <Link href="/search" className="text-purple-600 hover:underline">
              Continuar para busca
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
