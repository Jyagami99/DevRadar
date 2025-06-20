import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`Fazendo requisição para: ${config.baseURL}${config.url}`);
    console.log("Dados:", config.data);
    console.log("Parâmetros:", config.params);
    return config;
  },
  (error) => {
    console.error("Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`Resposta recebida de: ${response.config.url}`);
    console.log("Dados:", response.data);
    return response;
  },
  (error) => {
    console.error("Erro na resposta:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Developer {
  id?: string | number;
  avatarUrl: string;
  bio: string;
  githubUsername: string;
  latitude: number;
  longitude: number;
  name: string;
  techs: string[];
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  distance?: number;
  techs?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface RegisterDeveloperRequest {
  githubUsername: string;
  techs: string[];
  latitude: number;
  longitude: number;
}

export interface UpdateDeveloperRequest {
  githubUsername: string;
  techs: string[];
  latitude: number;
  longitude: number;
}

export async function searchDevelopers(
  params: SearchParams
): Promise<Developer[]> {
  try {
    const { latitude, longitude, distance = 10, techs } = params;

    const searchParams: Record<string, string> = {
      lat: latitude.toString(),
      lon: longitude.toString(),
      distance: distance.toString(),
    };

    if (techs && techs.trim()) {
      searchParams.techs = techs.trim();
    }

    console.log("Buscando desenvolvedores com parâmetros:", searchParams);

    const response = await api.get<Developer[]>("/devs/search/location", {
      params: searchParams,
    });

    const developers = response.data;

    console.log(`Encontrados ${developers.length} desenvolvedores`);

    return developers;
  } catch (error) {
    console.error("Erro ao buscar desenvolvedores:", error);

    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message:
          error.response?.data?.message ||
          error.message ||
          "Erro desconhecido na API",
        status: error.response?.status || 0,
        details: error.response?.data,
      };

      if (error.code === "ECONNREFUSED") {
        apiError.message =
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      } else if (error.code === "ETIMEDOUT") {
        apiError.message =
          "Tempo limite da requisição excedido. Tente novamente.";
      } else if (error.response?.status === 404) {
        apiError.message = "Endpoint não encontrado. Verifique a URL da API.";
      } else if (error.response?.status === 400) {
        apiError.message = "Dados inválidos para atualização.";
      } else if (error.response?.status === 500) {
        apiError.message =
          "Erro interno do servidor. Tente novamente mais tarde.";
      }

      throw apiError;
    }

    throw {
      message: "Erro inesperado ao buscar desenvolvedores",
      status: 0,
      details: error,
    } as ApiError;
  }
}

export async function registerDeveloper(
  developerData: RegisterDeveloperRequest
): Promise<Developer> {
  try {
    console.log("Registrando desenvolvedor na API:", developerData);

    const response = await api.post<Developer>("/devs", developerData);

    console.log("Desenvolvedor registrado com sucesso:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erro ao registrar desenvolvedor:", error);

    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message:
          error.response?.data?.message || "Erro ao registrar desenvolvedor",
        status: error.response?.status || 0,
        details: error.response?.data,
      };

      if (error.response?.status === 409) {
        apiError.message =
          "Desenvolvedor já cadastrado com este GitHub username.";
      } else if (error.response?.status === 400) {
        apiError.message =
          "Dados inválidos. Verifique as informações fornecidas.";
      } else if (error.code === "ECONNREFUSED") {
        apiError.message =
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      }

      throw apiError;
    }

    throw {
      message: "Erro inesperado ao registrar desenvolvedor",
      status: 0,
      details: error,
    } as ApiError;
  }
}

export async function updateDeveloperById(
  developerId: string | number,
  updateData: UpdateDeveloperRequest
): Promise<Developer> {
  try {
    console.log(`Atualizando desenvolvedor ID ${developerId}:`, updateData);

    const response = await api.put<Developer>(
      `/devs/${developerId}`,
      updateData
    );

    console.log("Desenvolvedor atualizado com sucesso:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar desenvolvedor:", error);

    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message:
          error.response?.data?.message || "Erro ao atualizar desenvolvedor",
        status: error.response?.status || 0,
        details: error.response?.data,
      };

      if (error.response?.status === 404) {
        apiError.message = "Desenvolvedor não encontrado.";
      } else if (error.response?.status === 400) {
        apiError.message = "Dados inválidos para atualização.";
      }

      throw apiError;
    }

    throw {
      message: "Erro inesperado ao atualizar desenvolvedor",
      status: 0,
      details: error,
    } as ApiError;
  }
}

export async function getDeveloperByUsername(
  github_username: string
): Promise<Developer> {
  try {
    console.log(`Buscando desenvolvedor por username: ${github_username}`);

    const response = await api.get<Developer>(
      `/devs/username/${github_username}`
    );

    console.log("Desenvolvedor encontrado:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar desenvolvedor:", error);

    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message:
          error.response?.data?.message || "Desenvolvedor não encontrado",
        status: error.response?.status || 0,
        details: error.response?.data,
      };

      throw apiError;
    }

    throw {
      message: "Erro inesperado ao buscar desenvolvedor",
      status: 0,
      details: error,
    } as ApiError;
  }
}

export async function getDeveloper(id: string | number): Promise<Developer> {
  try {
    console.log(`Buscando desenvolvedor por ID: ${id}`);

    const response = await api.get<Developer>(`/devs/id/${id}`);

    console.log("Desenvolvedor encontrado:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar desenvolvedor:", error);

    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message:
          error.response?.data?.message || "Desenvolvedor não encontrado",
        status: error.response?.status || 0,
        details: error.response?.data,
      };

      throw apiError;
    }

    throw {
      message: "Erro inesperado ao buscar desenvolvedor",
      status: 0,
      details: error,
    } as ApiError;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function addDistanceToDevs(
  developers: Developer[],
  userLat: number,
  userLon: number
) {
  return developers
    .map((dev) => ({
      ...dev,
      distance: calculateDistance(
        userLat,
        userLon,
        dev.latitude,
        dev.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    console.log("Verificando saúde da API...");

    await api.get("/actuator/health", { timeout: 5000 });

    console.log("API está funcionando");
    return true;
  } catch (error) {
    console.error("API não está disponível:", error);
    return false;
  }
}

export { api };
