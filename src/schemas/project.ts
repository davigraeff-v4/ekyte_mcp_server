import { z } from "zod";
import { PaginationSchema } from "./common.js";

// ============ READ SCHEMAS ============

export const ListProjectsSchema = PaginationSchema.extend({
  search: z.string().optional().describe("Busca por nome do projeto"),
  workspace_id: z.number().optional().describe("ID do workspace para filtrar os projetos"),
  status: z.number().optional().describe("Filtrar por status do projeto (situation)"),
  is_planning: z.number().optional().describe("Use 1 para filtrar projetos que são apenas planejamento (tarefas planejadas não ativas), 0 para não-planejamento"),
  endpoint_override: z.string().optional().describe("Opcional: override da rota da API (ex: 'projects', 'ctc-projects', 'plans'). Padrão é 'projects'.")
});
export type ListProjectsInput = z.infer<typeof ListProjectsSchema>;

export const ListProjectTemplatesSchema = PaginationSchema.extend({
  search: z.string().optional().describe("Busca por nome do modelo/template"),
  endpoint_override: z.string().optional().describe("Opcional: override da rota da API (ex: 'projects'). Padrão é 'projects'.")
});
export type ListProjectTemplatesInput = z.infer<typeof ListProjectTemplatesSchema>;

export const ListProjectTasksSchema = PaginationSchema.extend({
  project_id: z.number().describe("ID do projeto (obtido via ekyte_list_projects)"),
  search: z.string().optional().describe("Filtrar por nome da tarefa"),
  status: z.number().optional().describe("Filtrar por status da tarefa"),
});
export type ListProjectTasksInput = z.infer<typeof ListProjectTasksSchema>;

// ============ WRITE SCHEMAS ============

export const CreateProjectSchema = z.object({
  name: z.string().describe("Nome do projeto"),
  workspaceId: z.number().describe("ID do workspace onde o projeto será criado"),
  templateId: z.number().optional().describe("ID do modelo (template) do projeto, se houver"),
  startDate: z.string().optional().describe("Data de início no formato YYYY-MM-DD"),
  endDate: z.string().optional().describe("Data final no formato YYYY-MM-DD"),
  endpoint_override: z.string().optional().describe("Opcional: override da rota de criação. Padrão é 'projects'."),
  additional_payload: z.record(z.any()).optional().describe("Campos adicionais que podem ser requeridos pelo Ekyte para criar um projeto (JSON)")
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
