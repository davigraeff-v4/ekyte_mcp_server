/**
 * Ekyte API Client — Unified Authentication
 *
 * Uses a single Bearer Token (master token) for ALL requests.
 * The token is sent via Authorization header on every endpoint.
 *
 * Ekyte has two API "families" but both accept the same Bearer token:
 * - Public API: /v1.0/*, /v1.1/*, /v1.2/* (GET endpoints for reading data)
 * - Internal API: /api/* and /api/v2/* (POST/PATCH endpoints for writing data)
 *
 * Both share the same base URL: https://api.ekyte.com
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import { EKYTE_BASE_URL, REQUEST_TIMEOUT } from "../constants.js";

// ============ Configuration ============

function getConfig() {
  const bearerToken = process.env.EKYTE_BEARER_TOKEN;
  const companyId = process.env.EKYTE_COMPANY_ID;

  if (!bearerToken) {
    throw new Error(
      "EKYTE_BEARER_TOKEN não definido. " +
      "Configure o Bearer Token master do Ekyte como variável de ambiente."
    );
  }
  if (!companyId) {
    throw new Error(
      "EKYTE_COMPANY_ID não definido. " +
      "Configure o ID numérico da empresa no Ekyte (ex: 9312)."
    );
  }

  return { bearerToken, companyId };
}

// ============ Single HTTP Client ============

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!client) {
    const { bearerToken } = getConfig();
    client = axios.create({
      baseURL: EKYTE_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
        "Origin": "https://app.ekyte.com",
        "Referer": "https://app.ekyte.com/",
      },
    });
  }
  return client;
}

// ============ Error Handling ============

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const detail = typeof data === "string" ? data : JSON.stringify(data);

      switch (status) {
        case 400:
          return `Erro: Requisição inválida (400). Verifique os parâmetros enviados. Detalhes: ${detail}`;
        case 401:
          return "Erro: Token de autenticação inválido ou expirado (401). Verifique EKYTE_BEARER_TOKEN.";
        case 403:
          return "Erro: Sem permissão para esta ação (403). Verifique se o token tem permissões de admin.";
        case 404:
          return "Erro: Recurso não encontrado (404). Verifique se o ID informado está correto.";
        case 429:
          return "Erro: Muitas requisições (429). Aguarde alguns segundos e tente novamente.";
        case 500:
          return `Erro: Erro interno do servidor Ekyte (500). Tente novamente em alguns minutos. Detalhes: ${detail}`;
        default:
          return `Erro: API retornou status ${status}. Detalhes: ${detail}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Erro: Timeout na requisição. O servidor Ekyte não respondeu a tempo. Tente novamente.";
    } else if (error.code === "ECONNREFUSED") {
      return "Erro: Não foi possível conectar ao servidor Ekyte. Verifique se a URL está correta.";
    }
  }

  return `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`;
}

// ============ Unified API Methods ============

/** GET request — works for both public (/v1.x/) and internal (/api/) endpoints */
export async function apiGet<T>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const response = await getClient().get<T>(endpoint, { params });
  return response.data;
}

/** POST request */
export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await getClient().post<T>(endpoint, data);
  return response.data;
}

/** PUT request */
export async function apiPut<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  const response = await getClient().put<T>(endpoint, data);
  return response.data;
}

/** PATCH request (JSON Patch format used by Ekyte for updates) */
export async function apiPatch<T>(
  endpoint: string,
  data: unknown,
  params: Record<string, unknown> = {}
): Promise<T> {
  const response = await getClient().patch<T>(endpoint, data, { params });
  return response.data;
}

/** DELETE request */
export async function apiDelete<T>(
  endpoint: string
): Promise<T> {
  const response = await getClient().delete<T>(endpoint);
  return response.data;
}

// ============ Helper: Get Company ID ============

export function getCompanyId(): string {
  return getConfig().companyId;
}
