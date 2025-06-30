"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Loader2,
  ExternalLink,
  Save,
  RefreshCw,
  Globe,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getDeveloperByUsername,
  updateDeveloperById,
  type Developer,
  type ApiError,
} from "@/lib/api";

interface LocationData {
  latitude: number;
  longitude: number;
  source: "gps" | "ip" | "database" | "fallback";
  city?: string;
  region?: string;
  country?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [techs, setTechs] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [developer, setDeveloper] = useState<Developer | null>(null);

  const defaultLocation: LocationData = {
    latitude: -23.5505,
    longitude: -46.6333,
    source: "fallback",
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    console.log(session);
    if (session?.user?.username) {
      loadDeveloperProfile();
    }
  }, [session]);

  const loadDeveloperProfile = async () => {
    if (!session?.user?.username) return;

    setLoadingProfile(true);
    try {
      console.log("Buscando perfil do desenvolvedor:", session.user.username);

      const devProfile = await getDeveloperByUsername(session.user.username);
      setDeveloper(devProfile);

      if (devProfile.techs) {
        setTechs(devProfile.techs.join(", "));
      }
      setLocation({
        latitude: devProfile.latitude,
        longitude: devProfile.longitude,
        source: "database", // Dados vindos do banco de dados
      });

      console.log("Perfil carregado:", devProfile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        toast({
          title: "Perfil não encontrado",
          description:
            "Você ainda não possui um perfil. Redirecionando para o cadastro...",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      } else {
        toast({
          title: "Erro ao carregar perfil",
          description:
            apiError.message || "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const getLocationFromIP = async (): Promise<LocationData> => {
    try {
      console.log("Tentando obter localização via IP...");

      const response = await fetch(
        "http://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        console.log("Localização obtida via IP:", data);

        return {
          latitude: data.lat,
          longitude: data.lon,
          source: "ip",
          city: data.city,
          region: data.regionName,
          country: data.country,
        };
      } else {
        throw new Error(data.message || "Falha ao obter localização via IP");
      }
    } catch (error) {
      console.error("Erro ao obter localização via IP:", error);
      throw error;
    }
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000, // 10 segundos
              maximumAge: 60000, // 1 minuto
            });
          }
        );

        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "gps",
        };

        setLocation(locationData);
        setLocationLoading(false);

        toast({
          title: "Localização atualizada",
          description:
            "Sua localização atual foi detectada via GPS com sucesso.",
        });

        return;
      } catch (gpsError) {
        console.warn("Erro ao obter localização via GPS:", gpsError);

        try {
          const ipLocation = await getLocationFromIP();
          setLocation(ipLocation);

          toast({
            title: "Localização atualizada via IP",
            description: `Localização detectada em ${ipLocation.city}, ${ipLocation.region}, ${ipLocation.country}`,
          });
        } catch (ipError) {
          console.error("Erro ao obter localização via IP:", ipError);

          setLocation(defaultLocation);

          toast({
            title: "Localização padrão definida",
            description:
              "Não foi possível detectar sua localização. Usando localização padrão (São Paulo, Brasil).",
            variant: "destructive",
          });
        }
      }
    } else {
      try {
        const ipLocation = await getLocationFromIP();
        setLocation(ipLocation);

        toast({
          title: "Localização detectada via IP",
          description: `Geolocalização não suportada. Localização detectada em ${ipLocation.city}, ${ipLocation.region}, ${ipLocation.country}`,
        });
      } catch (ipError) {
        console.error("Erro ao obter localização via IP:", ipError);

        setLocation(defaultLocation);

        toast({
          title: "Localização padrão definida",
          description:
            "Geolocalização não suportada e não foi possível detectar via IP. Usando localização padrão.",
          variant: "destructive",
        });
      }
    }

    setLocationLoading(false);
  };

  const processTechs = (techsString: string): string[] => {
    return techsString
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!developer?.id) {
      toast({
        title: "Erro",
        description: "ID do desenvolvedor não encontrado.",
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
      const updateData = {
        githubUsername: developer.githubUsername,
        techs: techsArray,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      console.log("Atualizando perfil do desenvolvedor:", updateData);

      const updatedDev = await updateDeveloperById(developer.id, updateData);

      setDeveloper(updatedDev);

      toast({
        title: "Perfil atualizado com sucesso!",
        description:
          "Suas informações foram atualizadas e já estão disponíveis para outros desenvolvedores.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      const apiError = error as ApiError;

      toast({
        title: "Erro na atualização",
        description:
          apiError.message ||
          "Houve um erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocationDisplayText = (location: LocationData): string => {
    switch (location.source) {
      case "gps":
        return "Detectada via GPS";
      case "ip":
        return `Via IP: ${location.city}, ${location.region}, ${location.country}`;
      case "database":
        return "Localização salva no perfil";
      case "fallback":
        return "Localização padrão (São Paulo, Brasil)";
      default:
        return "Localização definida";
    }
  };

  const getLocationIcon = (source: string) => {
    switch (source) {
      case "gps":
        return <MapPin className="mr-2 h-4 w-4" />;
      case "ip":
        return <Globe className="mr-2 h-4 w-4" />;
      default:
        return <MapPin className="mr-2 h-4 w-4" />;
    }
  };

  if (status === "loading" || loadingProfile) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>
            {status === "loading" ? "Carregando..." : "Carregando perfil..."}
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
              Por favor, faça login com GitHub para ver seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/login")}>
              <img src={"/github.svg"} className="mr-2 h-4 w-4" />
              Entrar com GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const techsArray = processTechs(techs);

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || ""}
                  />
                  <AvatarFallback>
                    {session.user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{session.user.name}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  @{session.user.username}
                </p>
                {session.user.bio && (
                  <p className="text-sm mb-4">{session.user.bio}</p>
                )}
                <a
                  href={`https://github.com/${session.user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-purple-600 hover:text-purple-800"
                >
                  <img src={"/github.svg"} className="h-4 w-4 mr-1" />
                  Ver perfil no GitHub
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>

                {developer && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg w-full">
                    <p className="text-sm font-medium text-green-800">
                      Perfil Encontrado
                    </p>
                    <p className="text-xs text-green-600">ID: {developer.id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perfil de Desenvolvedor</CardTitle>
                  <CardDescription>
                    Atualize suas tecnologias e localização
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDeveloperProfile}
                  disabled={loadingProfile}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingProfile ? "animate-spin" : ""
                    }`}
                  />
                  Recarregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="techs">Tecnologias *</Label>
                  <Input
                    id="techs"
                    placeholder="React, Node.js, Python, TypeScript, etc."
                    value={techs}
                    onChange={(e) => setTechs(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Digite as tecnologias separadas por vírgula.
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
                  <div className="flex items-center gap-2">
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
                          {location ? (
                            getLocationIcon(location.source)
                          ) : (
                            <MapPin className="mr-2 h-4 w-4" />
                          )}
                          {location
                            ? "Atualizar Localização"
                            : "Detectar Localização"}
                        </>
                      )}
                    </Button>
                  </div>
                  {location !== null && (
                    <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <strong>Localização atual:</strong>
                        <Badge variant="secondary" className="text-xs">
                          {location.source === "gps"
                            ? "GPS"
                            : location.source === "ip"
                            ? "IP"
                            : location.source === "database"
                            ? "Banco"
                            : "Padrão"}
                        </Badge>
                      </div>
                      <div className="text-xs">
                        {getLocationDisplayText(location)}
                      </div>
                      <div className="text-xs mt-1">
                        <strong>Coordenadas:</strong>{" "}
                        {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>

                {techsArray.length > 0 && location && developer?.id && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Dados que serão atualizados:
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>
                        <strong>ID do Desenvolvedor:</strong> {developer.id}
                      </div>
                      <div>
                        <strong>Tecnologias:</strong>
                        <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                          [{techsArray.map((tech) => `"${tech}"`).join(", ")}]
                        </code>
                      </div>
                      <div>
                        <strong>Latitude:</strong>{" "}
                        {location.latitude.toFixed(6)}
                      </div>
                      <div>
                        <strong>Longitude:</strong>{" "}
                        {location.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdateProfile}
                disabled={
                  loading ||
                  !location ||
                  techsArray.length === 0 ||
                  !developer?.id
                }
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Atualizar Perfil
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
