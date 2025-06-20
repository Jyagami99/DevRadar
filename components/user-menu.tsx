"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, MapPin } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" disabled>
        Carregando...
      </Button>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="ghost">Entrar</Button>
        </Link>
        <Link href="/register">
          <Button>Cadastrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user?.image || ""}
              alt={session.user?.name || ""}
            />
            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">
            {session.user?.name}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            {session.user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex w-full cursor-pointer items-center"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({ callbackUrl: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
