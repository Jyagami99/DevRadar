"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DeveloperMap from "@/components/developer-map";
import { UserMenu } from "@/components/user-menu";
import { NavLinks } from "@/components/nav-links";
import {
  searchDevelopers,
  addDistanceToDevs,
  checkApiHealth,
  type Developer,
  type ApiError,
} from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DeveloperWithDistance extends Developer {
  distance: number;
}

export default function SearchPage() {
  const [searchTech, setSearchTech] = useState<string>("");
  const [searchDistance, setSearchDistance] = useState<string>("10");
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [filteredDevelopers, setFilteredDevelopers] = useState<
    DeveloperWithDistance[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [debouncedTech, setDebouncedTech] = useState<string>("");
  const [allDevelopers, setAllDevelopers] = useState<DeveloperWithDistance[]>(
    []
  );

  useEffect(() => {
    checkApiStatus();
    handleGetLocation();
  }, [searchDistance]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTech(searchTech);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTech]);

  useEffect(() => {
    if (!debouncedTech) {
      setFilteredDevelopers(allDevelopers);
    } else {
      const filtered = allDevelopers.filter((dev) =>
        dev.techs.some((tech) =>
          tech.toLowerCase().includes(debouncedTech.toLowerCase())
        )
      );
      setFilteredDevelopers(filtered);
    }
  }, [debouncedTech, allDevelopers]);

  const checkApiStatus = async () => {
    setApiStatus("checking");
    try {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? "online" : "offline");
    } catch (error) {
      setApiStatus("offline");
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    setError(null);

    // Função para usar localização padrão
    const useDefaultLocation = () => {
      const defaultLocation = {
        latitude: -23.5505,
        longitude: -46.6333,
      };
      setUserLocation(defaultLocation);
      handleSearch(defaultLocation);
    };

    // Função para tentar obter localização por IP usando API Route
    const tryIPLocationViaAPI = async () => {
      try {
        console.log("Tentando localização via API interna...");
        const response = await fetch("/api/location");
        const data = await response.json();

        if (data.latitude && data.longitude) {
          const location = {
            latitude: data.latitude,
            longitude: data.longitude,
          };

          console.log("Localização obtida via API:", location);
          setUserLocation(location);
          handleSearch(location);

          toast({
            title: "Localização aproximada",
            description: `Localização baseada no IP (${data.city}, ${data.country}) - menos precisa que GPS.`,
            variant: "default",
          });
          return true;
        }
      } catch (error) {
        console.error("Erro na API de localização:", error);
      }
      return false;
    };

    // Função para tentar obter localização por IP (fallback)
    const tryIPLocation = async () => {
      // Primeiro tenta via API interna (sem CORS)
      const apiSuccess = await tryIPLocationViaAPI();
      if (apiSuccess) return true;

      // Fallback para serviços externos (podem ter CORS)
      const ipServices = [
        {
          name: "ip-api direct",
          getLocation: async () => {
            const response = await fetch("http://ip-api.com/json/");
            const data = await response.json();

            if (data.status === "success") {
              return {
                latitude: data.lat,
                longitude: data.lon,
                city: data.city,
                country: data.country,
              };
            }
            return null;
          },
        },
      ];

      for (const service of ipServices) {
        try {
          console.log(`Tentando ${service.name}...`);
          const locationData = await service.getLocation();

          if (locationData) {
            const location = {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            };

            console.log(`Localização obtida via ${service.name}:`, location);
            setUserLocation(location);
            handleSearch(location);

            toast({
              title: "Localização aproximada",
              description: `Localização baseada no IP (${locationData.city}, ${locationData.country}) - menos precisa que GPS.`,
              variant: "default",
            });
            return true;
          }
        } catch (error) {
          console.error(`Erro com ${service.name}:`, error);
          continue;
        }
      }

      console.error("Todos os serviços de localização por IP falharam");
      return false;
    };

    // Verifica se a API está disponível
    if (!navigator.geolocation) {
      setLocationLoading(false);
      setError("Geolocalização não é suportada pelo seu navegador.");
      toast({
        title: "Geolocalização não suportada",
        description:
          "Seu navegador não suporta geolocalização. Usando localização padrão.",
        variant: "destructive",
      });
      useDefaultLocation();
      return;
    }

    // Primeira tentativa com configurações de alta precisão
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    // Segunda tentativa com configurações menos rigorosas
    const lowAccuracyOptions = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000,
    };

    // Função de sucesso
    const onSuccess = (position) => {
      console.log("Localização GPS obtida:", position);
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(location);
      setLocationLoading(false);
      handleSearch(location);
    };

    // Função para segunda tentativa
    const tryLowAccuracy = () => {
      console.log("Tentando com baixa precisão...");
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        async (error) => {
          console.error("Segunda tentativa falhou:", error);
          // setLocationLoading(false);

          // Tenta localização por IP como último recurso
          const ipSuccess = await tryIPLocation();
          if (!ipSuccess) {
            // Se tudo falhar, usa localização padrão
            setError("Não foi possível obter sua localização precisa.");
            toast({
              title: "Erro de localização",
              description:
                "Usando localização padrão (São Paulo). Verifique se o GPS está ativado.",
              variant: "destructive",
            });
            useDefaultLocation();
          }
          setLocationLoading(false);
        },
        lowAccuracyOptions
      );
    };

    // Primeira tentativa com alta precisão
    const onError = async (error) => {
      console.error("Primeira tentativa falhou:", error);

      let errorMessage = "Erro desconhecido ao obter localização.";
      let shouldTryFallback = true;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permissão negada pelo usuário.";
          shouldTryFallback = false; // Não adianta tentar novamente
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage =
            "Localização não disponível. Tentando com configurações diferentes...";
          break;
        case error.TIMEOUT:
          errorMessage = "Timeout na primeira tentativa. Tentando novamente...";
          break;
      }

      console.log(errorMessage);

      if (shouldTryFallback && error.code !== error.PERMISSION_DENIED) {
        // Tenta segunda vez com configurações menos rigorosas
        tryLowAccuracy();
      } else {
        // Se foi negação de permissão, tenta localização por IP
        // setLocationLoading(false);
        const ipSuccess = await tryIPLocation();
        if (!ipSuccess) {
          setError("Acesso à localização foi negado.");
          toast({
            title: "Permissão negada",
            description:
              "Para usar sua localização, permita o acesso nas configurações do navegador.",
            variant: "destructive",
          });
          useDefaultLocation();
        }
        setLocationLoading(false);
      }
    };

    // Inicia primeira tentativa
    console.log("Iniciando primeira tentativa de geolocalização...");
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      highAccuracyOptions
    );
  };

  // Função para verificar se o dispositivo suporta GPS
  const checkGPSCapability = () => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isSecureContext = window.isSecureContext;

    console.log("Dispositivo móvel:", isMobile);
    console.log("Contexto seguro (HTTPS):", isSecureContext);
    console.log("Geolocalização disponível:", "geolocation" in navigator);

    return {
      isMobile,
      isSecureContext,
      hasGeolocation: "geolocation" in navigator,
    };
  };

  // Função para diagnóstico completo
  const diagnosticGeolocation = () => {
    const capability = checkGPSCapability();

    console.log("=== DIAGNÓSTICO DE GEOLOCALIZAÇÃO ===");
    console.log("URL atual:", window.location.href);
    console.log("Protocolo:", window.location.protocol);
    console.log("Capabilities:", capability);

    if (
      !capability.isSecureContext &&
      window.location.hostname !== "localhost"
    ) {
      console.warn("⚠️ AVISO: Geolocalização requer HTTPS em produção!");
    }

    if (!capability.isMobile) {
      console.warn("⚠️ Desktop: Localização pode ser menos precisa");
    }
  };

  const handleSearch = async (
    location?: { latitude: number; longitude: number },
    tech?: string,
    distance?: string
  ) => {
    const resolvedLocation = location ?? userLocation;
    const resolvedTech = tech ?? debouncedTech;
    const resolvedDistance = distance ?? searchDistance;

    if (!resolvedLocation) {
      toast({
        title: "Localização necessária",
        description:
          "Por favor, compartilhe sua localização para buscar desenvolvedores.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando busca de desenvolvedores...");

      const devs = await searchDevelopers({
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
        distance: Number.parseInt(resolvedDistance),
        techs: "",
      });

      const devsWithDistance = addDistanceToDevs(
        devs,
        resolvedLocation.latitude,
        resolvedLocation.longitude
      );

      setAllDevelopers(devsWithDistance);
      setFilteredDevelopers(devsWithDistance);

      toast({
        title: "Busca concluída",
        description: `Encontrados ${devsWithDistance.length} desenvolvedores em um raio de ${resolvedDistance}km.`,
      });
    } catch (error) {
      console.error("Erro na busca:", error);

      const apiError = error as ApiError;
      let errorMessage = "Erro ao buscar desenvolvedores. Tente novamente.";

      if (apiError.status === 0) {
        errorMessage =
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
        setApiStatus("offline");
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      setError(errorMessage);
      toast({
        title: "Erro na busca",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">Encontrar Desenvolvedores</h1>
          <NavLinks />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {apiStatus === "checking" ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : apiStatus === "online" ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-500">
              API{" "}
              {apiStatus === "checking"
                ? "verificando..."
                : apiStatus === "online"
                ? "online"
                : "offline"}
            </span>
          </div>
          <UserMenu />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {apiStatus === "offline" && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={checkApiStatus}
              >
                Tentar novamente
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {apiStatus === "offline" && (
        <Alert className="mb-6">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            O backend não está disponível. Verifique se está rodando em{" "}
            <code className="bg-gray-100 px-1 rounded">
              {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}
            </code>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tech-search">Buscar por tecnologia</Label>
                  <div className="flex">
                    <Input
                      id="tech-search"
                      placeholder="React, Node.js, Python, etc."
                      value={searchTech}
                      onChange={(e) => setSearchTech(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button
                      type="submit"
                      disabled={
                        loading || locationLoading || apiStatus === "offline"
                      }
                      className="rounded-l-none bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Digite uma tecnologia para filtrar os desenvolvedores
                    (opcional)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance-select">Raio de busca</Label>
                  <Select
                    value={searchDistance}
                    onValueChange={setSearchDistance}
                  >
                    <SelectTrigger id="distance-select">
                      <SelectValue placeholder="Selecione a distância" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                      <SelectItem value="250">250 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-500">
                  {userLocation ? (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Usando sua localização atual
                      <br />
                      <span className="text-xs">
                        Lat: {userLocation.latitude.toFixed(6)}, Lon:{" "}
                        {userLocation.longitude.toFixed(6)}
                      </span>
                    </div>
                  ) : locationLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Detectando sua localização...
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Compartilhar minha localização
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchTech("");
                    setSearchDistance("10");
                    setFilteredDevelopers(allDevelopers);
                  }}
                  disabled={loading}
                >
                  Resetar filtros
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              Desenvolvedores Encontrados ({filteredDevelopers.length})
              {searchDistance && ` - Raio de ${searchDistance}km`}
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Buscando desenvolvedores...</p>
              </div>
            ) : filteredDevelopers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTech ? (
                  <div>
                    <p>Nenhum desenvolvedor encontrado com "{searchTech}"</p>
                    <p className="text-sm">em um raio de {searchDistance}km.</p>
                  </div>
                ) : (
                  <div>
                    <p>Nenhum desenvolvedor encontrado</p>
                    <p className="text-sm">em um raio de {searchDistance}km.</p>
                  </div>
                )}
              </div>
            ) : (
              filteredDevelopers.map((dev, index) => (
                <Card
                  key={`${dev.githubUsername}-${index}`}
                  className="overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={dev.avatarUrl || "/placeholder.svg"}
                          alt={dev.name}
                        />
                        <AvatarFallback>{dev.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{dev.name}</h3>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {dev.distance.toFixed(1)}km
                          </div>
                        </div>
                        {dev.bio && (
                          <p className="text-sm text-gray-500">{dev.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dev.techs.map((tech, index) => (
                            <Badge
                              key={index}
                              variant={"outline"}
                              className="bg-purple-50"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3">
                          <a
                            href={`https://github.com/${dev.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center text-purple-600 hover:text-purple-800"
                          >
                            <img src={"/github.svg"} className="h-3 w-3 mr-1" />
                            Ver Perfil no GitHub
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-150px)] min-h-[500px]">
            <CardContent className="p-0 h-full">
              {userLocation ? (
                <DeveloperMap
                  userLocation={userLocation}
                  developers={filteredDevelopers}
                  searchRadius={Number.parseInt(searchDistance)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {locationLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Detectando sua localização...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                      <MapPin className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="mb-4">
                        Por favor, compartilhe sua localização para ver o mapa
                      </p>
                      <Button onClick={handleGetLocation}>
                        Compartilhar Localização
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
