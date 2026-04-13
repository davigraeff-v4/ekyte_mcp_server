/**
 * Common Zod schemas shared across tools
 */

import { z } from "zod";

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

export const PaginationSchema = z.object({
  page: z.number()
    .int("Página deve ser número inteiro")
    .min(1, "Página deve ser >= 1")
    .default(1)
    .describe("Número da página (inicia em 1). Cada página retorna até 100 registros."),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Formato de saída: 'markdown' para leitura humana ou 'json' para dados estruturados"),
});

export const DateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD (ex: 2026-04-13)")
  .describe("Data no formato AAAA-MM-DD");

export const TimeSchema = z.string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora deve estar no formato HH:MM ou HH:MM:SS")
  .describe("Hora no formato HH:MM ou HH:MM:SS");

export const WorkspaceIdSchema = z.number()
  .int("ID do workspace deve ser número inteiro")
  .positive("ID do workspace deve ser positivo")
  .describe("ID numérico do workspace no Ekyte. Use ekyte_list_workspaces para descobrir o ID.");

export const TaskIdSchema = z.number()
  .int("ID da task deve ser número inteiro")
  .positive("ID da task deve ser positivo")
  .describe("ID numérico da task no Ekyte. Use ekyte_list_tasks para descobrir o ID.");

export const UserIdSchema = z.string()
  .uuid("ID do usuário deve ser um UUID válido")
  .describe("UUID do usuário no Ekyte. Use ekyte_list_users para descobrir o ID.");
