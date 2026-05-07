#!/usr/bin/env npx ts-node
/**
 * Batch Phase Updater for Ekyte Project 293237
 * 
 * For each of the 45 tasks:
 * 1. GET the full task
 * 2. Keep only phases 39569 (Execução [TECH]) and 30747 (Aprovação Interna [COOR]) active
 * 3. Deactivate all other phases
 * 4. Set correct executors
 * 5. PUT the updated task
 */

import axios from "axios";

const TOKEN = process.env.EKYTE_BEARER_TOKEN!;
const COMPANY_ID = "9312";
const PROJECT_ID = 293237;
const BASE = "https://api.ekyte.com/api/v2";

// Target phases
const PHASE_EXEC_TECH = 39569;  // Execução [TECH] → Thiago
const PHASE_APROV_COOR = 30747; // Aprovação Interna [COOR] → Pedro
const EXECUTOR_THIAGO = "83fc8dac-2298-44af-a368-9f40c4010398";
const EXECUTOR_PEDRO = "03ce6378-35f9-4456-a66a-b6b495684b21";

const TASK_IDS = [
  2771045, 2771046, 2771047, 2771048, 2771049, 2771050, 2771051, 2771052, 2771053,
  2771055, 2771065, 2771056, 2771057, 2771058, 2771059, 2771060, 2771061, 2771062,
  2771063, 2771044, 2771064, 2771042, 2771043, 2771041, 2771022, 2771023, 2771025,
  2771024, 2771027, 2771028, 2771026, 2771029, 2771030, 2771031, 2771032, 2771033,
  2771034, 2771035, 2771036, 2771037, 2771038, 2771039, 2771040, 2771054, 2771066
];

const client = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${TOKEN}`,
    "Origin": "https://app.ekyte.com",
    "Referer": "https://app.ekyte.com/",
  },
});

interface FlowPhase {
  sequential: number;
  taskTypeId: number;
  active: number;
  ctcTaskProjectTaskId: number;
  daysToStart: number;
  duration: number;
  effort: number;
  executorId: string;
  phaseId: number;
  coPhaseId: number | null;
  phase?: { id: number; name: string; sequential: number };
  [key: string]: unknown;
}

async function getTask(taskId: number): Promise<Record<string, unknown>> {
  const resp = await client.get(`/companies/${COMPANY_ID}/projects/${PROJECT_ID}/tasks/${taskId}`);
  return resp.data;
}

async function updateTask(taskId: number, body: Record<string, unknown>): Promise<void> {
  await client.put(`/companies/${COMPANY_ID}/projects/${PROJECT_ID}/tasks/${taskId}`, body);
}

function buildPutBody(task: Record<string, unknown>): Record<string, unknown> {
  const flow = (task.flow as FlowPhase[]) || [];
  
  // Build updated flow: only 39569 and 30747 active, all others inactive
  const updatedFlow = flow.map((phase) => {
    const p = { ...phase };
    if (p.phaseId === PHASE_EXEC_TECH) {
      p.active = 1;
      p.executorId = EXECUTOR_THIAGO;
    } else if (p.phaseId === PHASE_APROV_COOR) {
      p.active = 1;
      p.executorId = EXECUTOR_PEDRO;
    } else {
      p.active = 0; // Deactivate all others
    }
    return p;
  });

  // Check if required phases exist in flow, add if missing
  const hasExecTech = updatedFlow.some(p => p.phaseId === PHASE_EXEC_TECH);
  const hasAprovCoor = updatedFlow.some(p => p.phaseId === PHASE_APROV_COOR);
  const taskTypeId = (task.ctcTaskTypeId as number) || (flow[0]?.taskTypeId ?? 0);
  const taskId = task.id as number;

  if (!hasExecTech) {
    updatedFlow.push({
      sequential: updatedFlow.length + 1,
      taskTypeId,
      active: 1,
      ctcTaskProjectTaskId: taskId,
      daysToStart: 0,
      duration: 0,
      effort: 60,
      executorId: EXECUTOR_THIAGO,
      phaseId: PHASE_EXEC_TECH,
      coPhaseId: null,
    });
  }

  if (!hasAprovCoor) {
    updatedFlow.push({
      sequential: updatedFlow.length + 1,
      taskTypeId,
      active: 1,
      ctcTaskProjectTaskId: taskId,
      daysToStart: 0,
      duration: 0,
      effort: 60,
      executorId: EXECUTOR_PEDRO,
      phaseId: PHASE_APROV_COOR,
      coPhaseId: null,
    });
  }

  // Clean flowPhases (without nested objects)
  const flowPhases = updatedFlow.map(p => ({
    sequential: p.sequential,
    taskTypeId: p.taskTypeId,
    active: p.active,
    ctcTaskProjectTaskId: p.ctcTaskProjectTaskId ?? taskId,
    daysToStart: p.daysToStart ?? 0,
    duration: p.duration ?? 0,
    effort: p.effort ?? 0,
    executorId: p.executorId,
    phaseId: p.phaseId,
    coPhaseId: p.coPhaseId ?? null,
  }));

  // Effort formatting
  const totalEffort = (task.effort as number) ?? 0;
  const effortH = Math.floor(totalEffort / 60);
  const effortM = totalEffort % 60;

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    ctcTaskTypeId: task.ctcTaskTypeId,
    ctcTaskType: task.ctcTaskType,
    ctcTaskProjectId: task.ctcTaskProjectId ?? PROJECT_ID,
    ctcTaskProject: task.ctcTaskProject,
    ctcTaskProjectPhaseId: task.ctcTaskProjectPhaseId,
    ctcTaskProjectPhase: task.ctcTaskProjectPhase,
    ctcTaskProjectChecklists: task.ctcTaskProjectChecklists ?? [],
    effort: totalEffort,
    effortFormated: `${String(effortH).padStart(2, "0")}:${String(effortM).padStart(2, "0")}`,
    effortHour: String(effortH).padStart(2, "0"),
    effortMinute: String(effortM).padStart(2, "0"),
    daysToStart: task.daysToStart ?? 0,
    daysToComplete: task.daysToComplete ?? 0,
    dueDate: "",
    priority: task.priority ?? 10,
    priorityGroup: task.priorityGroup ?? 0,
    sequential: task.sequential ?? 0,
    quantity: task.quantity ?? 0,
    allocationType: task.allocationType ?? 20,
    flowAutoAdjust: task.flowAutoAdjust ?? 1,
    addTaskTypeChecklists: task.addTaskTypeChecklists ?? 1,
    recurring: task.recurring ?? 0,
    recurringFrequency: task.recurringFrequency ?? 0,
    recurringLimit: task.recurringLimit ?? 0,
    recurringMonthOption: task.recurringMonthOption ?? 0,
    recurringDays: task.recurringDays ?? null,
    predecessorId: task.predecessorId ?? null,
    predecessor: task.predecessor ?? null,
    ctcTaskPredecessorId: task.ctcTaskPredecessorId ?? null,
    ctcTaskPredecessor: task.ctcTaskPredecessor ?? null,
    placementStartDays: task.placementStartDays ?? null,
    placementEndDays: task.placementEndDays ?? null,
    placementStartTime: task.placementStartTime ?? null,
    placementEndTime: task.placementEndTime ?? null,
    setPlacementEndDays: task.setPlacementEndDays ?? false,
    tags: task.tags ?? [],
    medias: task.medias ?? [],
    channels: task.channels ?? [],
    artifacts: task.artifacts ?? [],
    flow: updatedFlow,
    flowPhases,
  };
}

async function processTask(taskId: number, index: number): Promise<{ taskId: number; status: string; detail: string }> {
  try {
    // 1. GET task
    const task = await getTask(taskId);
    const title = task.title as string;
    const flow = (task.flow as FlowPhase[]) || [];
    
    const activePhases = flow.filter(p => p.active === 1);
    const activeIds = activePhases.map(p => p.phaseId);
    
    // Check if already correct
    const alreadyCorrect = 
      activeIds.length === 2 && 
      activeIds.includes(PHASE_EXEC_TECH) && 
      activeIds.includes(PHASE_APROV_COOR) &&
      activePhases.find(p => p.phaseId === PHASE_EXEC_TECH)?.executorId === EXECUTOR_THIAGO &&
      activePhases.find(p => p.phaseId === PHASE_APROV_COOR)?.executorId === EXECUTOR_PEDRO;
    
    if (alreadyCorrect) {
      console.log(`[${index + 1}/45] ⏭️  #${taskId} "${title}" — já está correto`);
      return { taskId, status: "SKIPPED", detail: "Already correct" };
    }

    // 2. Build PUT body
    const putBody = buildPutBody(task);
    
    // 3. PUT
    await updateTask(taskId, putBody);
    
    // 4. Log
    const deactivated = flow.filter(p => p.active === 1 && p.phaseId !== PHASE_EXEC_TECH && p.phaseId !== PHASE_APROV_COOR);
    const deactivatedNames = deactivated.map(p => (p.phase as any)?.name ?? `Phase ${p.phaseId}`);
    
    console.log(`[${index + 1}/45] ✅ #${taskId} "${title}" — ${deactivatedNames.length} fases desativadas: ${deactivatedNames.join(", ") || "nenhuma"}`);
    return { taskId, status: "OK", detail: `Deactivated: ${deactivatedNames.join(", ")}` };
    
  } catch (error: any) {
    const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error(`[${index + 1}/45] ❌ #${taskId} — ERRO: ${msg}`);
    return { taskId, status: "ERROR", detail: msg };
  }
}

async function main() {
  console.log("=".repeat(80));
  console.log("🚀 Batch Phase Updater — Projeto 293237");
  console.log(`   Ativando: Execução [TECH] (${PHASE_EXEC_TECH}) + Aprovação Interna [COOR] (${PHASE_APROV_COOR})`);
  console.log(`   Executores: Thiago (TECH) + Pedro (COOR)`);
  console.log(`   Total: ${TASK_IDS.length} tarefas`);
  console.log("=".repeat(80));

  const results: { taskId: number; status: string; detail: string }[] = [];

  for (let i = 0; i < TASK_IDS.length; i++) {
    const result = await processTask(TASK_IDS[i], i);
    results.push(result);
    
    // Small delay to not overwhelm the API
    await new Promise(r => setTimeout(r, 300));
  }

  // Summary
  const ok = results.filter(r => r.status === "OK").length;
  const skipped = results.filter(r => r.status === "SKIPPED").length;
  const errors = results.filter(r => r.status === "ERROR");

  console.log("\n" + "=".repeat(80));
  console.log("📊 RESUMO:");
  console.log(`   ✅ Atualizadas: ${ok}`);
  console.log(`   ⏭️  Já corretas: ${skipped}`);
  console.log(`   ❌ Erros: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log("\n   Tarefas com erro:");
    errors.forEach(e => console.log(`     - #${e.taskId}: ${e.detail}`));
  }
  console.log("=".repeat(80));
}

main().catch(console.error);
