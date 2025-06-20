"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Loader2, User, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  registerDeveloper,
  getDeveloperByUsername,
  type ApiError,
  type RegisterDeveloperRequest,
} from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [checkingExistingProfile, setCheckingExistingProfile] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);
  const [techs, setTechs] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.username) {
      checkExistingProfile();
    }
  }, [status, session]);

  const checkExistingProfile = async () => {
    if (!session?.user?.username) return;

    setCheckingExistingProfile(true);
    try {
      console.log(
        "Verificando se usuário já possui perfil:",
        session.user.username
      );

      await getDeveloperByUsername(session.user.username);

      setExistingProfile(true);

      toast({
        title: "Perfil já existe!",
        description:
          "Você já possui um perfil de desenvolvedor. Redirecionando para seu perfil...",
      });

      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        console.log("Usuário pode se registrar - perfil não encontrado");
        setExistingProfile(false);
      } else {
        console.error("Erro ao verificar perfil existente:", error);
        toast({
          title: "Erro ao verificar perfil",
          description:
            "Houve um erro ao verificar se você já possui um perfil.",
          variant: "destructive",
        });
      }
    } finally {
      setCheckingExistingProfile(false);
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
          toast({
            title: "Localização detectada",
            description: "Sua localização atual foi detectada com sucesso.",
          });
        },
        (error) => {
          const defaultLocation = {
            latitude: -23.5505,
            longitude: -46.6333,
          };
          setLocation(defaultLocation);
          // console.error(
          //   "Erro ao obter localização:",
          //   "Code =",
          //   error.code,
          //   "| Message =",
          //   error.message
          // );

          setLocationLoading(false);

          // let errorMessage = "Não foi possível obter sua localização.";

          // switch (error.code) {
          //   case 1: // PERMISSION_DENIED
          //     errorMessage =
          //       "Permissão negada para acessar localização. Por favor, permita o acesso nas configurações do navegador.";
          //     break;
          //   case 2: // POSITION_UNAVAILABLE
          //     errorMessage =
          //       "Informação de localização indisponível. Tente novamente mais tarde.";
          //     break;
          //   case 3: // TIMEOUT
          //     errorMessage =
          //       "Tempo para obter localização esgotado. Tente novamente.";
          //     break;
          //   default:
          //     errorMessage = "Erro desconhecido ao obter localização.";
          // }

          // toast({
          //   title: "Erro de localização",
          //   description: errorMessage,
          //   variant: "destructive",
          // });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive",
      });
    }
  };

  const processTechs = (techsString: string): string[] => {
    return techsString
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast({
        title: "Autenticação necessária",
        description:
          "Por favor, faça login com GitHub para se registrar como desenvolvedor.",
        variant: "destructive",
      });
      return;
    }

    if (!techs.trim()) {
      toast({
        title: "Informação obrigatória",
        description: "Por favor, informe pelo menos uma tecnologia.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Localização obrigatória",
        description: "Por favor, compartilhe sua localização para continuar.",
        variant: "destructive",
      });
      return;
    }

    const techsArray = processTechs(techs);
    if (techsArray.length === 0) {
      toast({
        title: "Tecnologias inválidas",
        description: "Por favor, informe pelo menos uma tecnologia válida.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const developerRequest: RegisterDeveloperRequest = {
        githubUsername:
          session.user.username ||
          session.user.email?.split("@")[0] ||
          session.user.name ||
          "",
        techs: techsArray,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      console.log("Dados para enviar à API:", developerRequest);

      const registeredDev = await registerDeveloper(developerRequest);

      console.log("Desenvolvedor registrado:", registeredDev);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Bem-vindo! Seu perfil foi criado e você já pode ser encontrado por outros desenvolvedores.`,
      });

      router.push("/profile");
    } catch (error) {
      console.error("Erro ao registrar desenvolvedor:", error);

      const apiError = error as ApiError;

      toast({
        title: "Erro no cadastro",
        description:
          apiError.message ||
          "Houve um erro ao criar seu perfil. Tente novamente.",
        variant: "destructive",
      });

      if (apiError.status === 409 || apiError.message.includes("já existe")) {
        toast({
          title: "Desenvolvedor já cadastrado",
          description:
            "Você já possui um perfil. Redirecionando para a página de perfil...",
        });
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || checkingExistingProfile) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>
            {status === "loading"
              ? "Carregando..."
              : "Verificando perfil existente..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Autenticação Necessária</CardTitle>
            <CardDescription>
              Por favor, faça login com GitHub para se registrar como
              desenvolvedor.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/login">
              <Button>
                <img src={"/github.svg"} className="h-4 w-4 mr-2" />
                Entrar com GitHub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <User className="mr-2 h-6 w-6 text-green-600" />
              Perfil já existe!
            </CardTitle>
            <CardDescription>
              Você já possui um perfil de desenvolvedor cadastrado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-green-800">
                  {session.user.name}
                </h3>
                <p className="text-sm text-green-600">
                  @{session.user.username}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Redirecionando para seu perfil em alguns segundos...
              </p>
              <Link href="/profile">
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Ir para meu Perfil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const techsArray = processTechs(techs);

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Complete seu Perfil de Desenvolvedor
          </CardTitle>
          <CardDescription>
            Compartilhe suas tecnologias e localização para ser encontrado por
            outros desenvolvedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{session.user.name}</h3>
                <p className="text-sm text-gray-500">
                  GitHub: @
                  {session.user.username ||
                    session.user.email?.split("@")[0] ||
                    session.user.name}
                </p>
                {session.user.bio && (
                  <p className="text-sm text-gray-600 mt-1">
                    {session.user.bio}
                  </p>
                )}
                <a
                  href={`https://github.com/${session.user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center mt-2"
                >
                  <img src={"/github.svg"} className="h-3 w-3 mr-1" />
                  Ver perfil no GitHub
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techs">Tecnologias *</Label>
              <Input
                id="techs"
                placeholder="React, Node.js, Python, TypeScript, etc."
                value={techs}
                onChange={(e) => setTechs(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Digite as tecnologias que você domina, separadas por vírgula.
              </p>

              {techsArray.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Tecnologias ({techsArray.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {techsArray.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-purple-50 text-purple-700"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Sua Localização *</Label>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="w-full"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detectando localização...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      {location
                        ? "Atualizar Localização"
                        : "Compartilhar Minha Localização"}
                    </>
                  )}
                </Button>

                {location && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center text-green-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium">Localização detectada</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Coordenadas: {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Sua localização será usada para conectar você com
                desenvolvedores próximos.
              </p>
            </div>

            {techsArray.length > 0 && location && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">
                  Dados que serão enviados:
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div>
                    <strong>GitHub Username:</strong>{" "}
                    {session.user.username ||
                      session.user.email?.split("@")[0] ||
                      session.user.name}
                  </div>
                  <div>
                    <strong>Tecnologias (array):</strong>
                    <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                      [{techsArray.map((tech) => `"${tech}"`).join(", ")}]
                    </code>
                  </div>
                  <div>
                    <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                  </div>
                  <div>
                    <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || !location || techsArray.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando dados...
              </>
            ) : (
              "Completar Registro"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
