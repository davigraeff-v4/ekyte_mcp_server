/**
 * Zod schemas for time tracking (apontamento de horas)
 */

import { z } from "zod";
import {
  DateSchema,
  TimeSchema,
  WorkspaceIdSchema,
  TaskIdSchema,
  ResponseFormat,
} from "./common.js";

// ============ Create Time Entry WITH Task ============

export const CreateTimeEntryWithTaskSchema = z.object({
  workspace_id: WorkspaceIdSchema,
  task_id: TaskIdSchema,
  date: DateSchema
    .describe("Data do apontamento no formato AAAA-MM-DD (ex: 2026-04-13)"),
  start_time: TimeSchema
    .describe("Hora de início no formato HH:MM (ex: 08:30)"),
  end_time: TimeSchema
    .describe("Hora de fim no formato HH:MM (ex: 13:08)"),
  comment: z.string()
    .max(1000, "Comentário deve ter no máximo 1000 caracteres")
    .default("")
    .describe("Comentário opcional sobre o apontamento"),
  manual_time: z.string()
    .regex(/^\d{2}:\d{2}$/, "Horário manual deve ser no formato HH:MM")
    .optional()
    .describe("Horário manual de referência no formato HH:MM (opcional)"),
}).strict();

export type CreateTimeEntryWithTaskInput = z.infer<typeof CreateTimeEntryWithTaskSchema>;

// ============ Create Time Entry WITHOUT Task ============

export const CreateTimeEntryWithoutTaskSchema = z.object({
  workspace_id: WorkspaceIdSchema,
  task_type_id: z.number()
    .int()
    .positive()
    .describe("ID do tipo de tarefa. Use ekyte_list_task_types para descobrir o ID."),
  phase_id: z.number()
    .int()
    .positive()
    .describe("ID da etapa. Obtido dos dados do tipo de tarefa."),
  date: DateSchema
    .describe("Data do apontamento no formato AAAA-MM-DD (ex: 2026-04-13)"),
  start_time: TimeSchema
    .describe("Hora de início no formato HH:MM (ex: 08:30)"),
  end_time: TimeSchema
    .describe("Hora de fim no formato HH:MM (ex: 13:08)"),
  comment: z.string()
    .max(1000, "Comentário deve ter no máximo 1000 caracteres")
    .default("")
    .describe("Comentário opcional sobre o apontamento"),
  non_productive: z.boolean()
    .default(false)
    .describe("Se true, marca o apontamento como 'não produtivo'"),
}).strict();

export type CreateTimeEntryWithoutTaskInput = z.infer<typeof CreateTimeEntryWithoutTaskSchema>;

// ============ List Time Entries ============

export const ListTimeEntriesSchema = z.object({
  workspace_id: WorkspaceIdSchema,
  date_from: DateSchema
    .optional()
    .describe("Data inicial do filtro no formato AAAA-MM-DD"),
  date_to: DateSchema
    .optional()
    .describe("Data final do filtro no formato AAAA-MM-DD"),
  user_id: z.string()
    .uuid()
    .optional()
    .describe("UUID do usuário para filtrar apontamentos. Use ekyte_list_users para descobrir."),
  page: z.number().int().min(1).default(1)
    .describe("Número da página"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Formato de saída"),
}).strict();

export type ListTimeEntriesInput = z.infer<typeof ListTimeEntriesSchema>;

// ============ Delete Time Entry ============

export const DeleteTimeEntrySchema = z.object({
  workspace_id: WorkspaceIdSchema,
  time_entry_id: z.number()
    .int("ID do apontamento deve ser número inteiro")
    .positive("ID do apontamento deve ser positivo")
    .describe("ID numérico do apontamento a ser deletado. Use ekyte_list_time_entries para descobrir o ID."),
}).strict();

export type DeleteTimeEntryInput = z.infer<typeof DeleteTimeEntrySchema>;
